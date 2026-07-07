"use client";

import * as THREE from "three";
import { useEffect, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { colorById, fabricById, threadById } from "@/lib/catalog";
import {
  embroideryKey,
  ensureEmbroideryFonts,
  renderEmbroideryCanvas,
} from "@/lib/embroidery";
import { countEmbroideryChars } from "@/lib/pricing";
import type { DesignConfig } from "@/lib/types";

/* ------------------------------------------------------------------ */
/*  Procedural garment system                                          */
/*  1 scene unit = 1 meter. Garments are rebuilt live from the         */
/*  customer's measurements — the pattern IS the preview.              */
/* ------------------------------------------------------------------ */

const cmR = (flatWidthCm: number) => flatWidthCm / (Math.PI * 100); // flat width → lathe radius

/* ------------------------- fabric material ------------------------ */

function useFabricMaterial(cfg: DesignConfig, windStrength = 1) {
  const material = useMemo(() => {
    const fabric = fabricById(cfg.fabricId);
    const color = colorById(cfg.colorId);
    const finishRough =
      cfg.finish === "matte" ? 1.08 : cfg.finish === "satin" ? 0.82 : 1.0;
    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(color.hex),
      /* matte-fabric floor — cloth never reads as plastic */
      roughness: Math.min(1, Math.max(0.62, fabric.roughness * finishRough)),
      metalness: 0.0,
      sheen: cfg.finish === "velvet" ? 1 : Math.max(0.35, fabric.sheen),
      sheenRoughness: cfg.finish === "velvet" ? 0.9 : 0.55,
      sheenColor: new THREE.Color(color.hex).lerp(new THREE.Color("#fff8ea"), 0.5),
      side: THREE.DoubleSide,
    });
    mat.envMapIntensity = 0.55;
    const amp = 0.016 * windStrength;
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = { value: 0 };
      shader.vertexShader =
        `uniform float uTime;\n` +
        shader.vertexShader.replace(
          "#include <begin_vertex>",
          `#include <begin_vertex>
           float swayW = 1.0 - smoothstep(0.0, 1.35, transformed.y);
           transformed.x += sin(uTime * 1.15 + transformed.y * 4.2) * ${amp.toFixed(4)} * swayW;
           transformed.z += cos(uTime * 0.85 + transformed.y * 3.1 + transformed.x * 2.0) * ${(amp * 0.8).toFixed(4)} * swayW;`
        );
      mat.userData.shader = shader;
    };
    mat.customProgramCacheKey = () => `fabric-wind-${amp.toFixed(4)}`;
    return mat;
  }, [cfg.fabricId, cfg.colorId, cfg.finish, windStrength]);

  useEffect(() => () => material.dispose(), [material]);

  useFrame((state) => {
    const shader = material.userData.shader as { uniforms: { uTime: { value: number } } } | undefined;
    if (shader) shader.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return material;
}

function useTrimMaterial(cfg: DesignConfig) {
  const material = useMemo(() => {
    const gold = cfg.border === "gold-trim";
    const base = gold
      ? new THREE.Color("#c9a961")
      : new THREE.Color(colorById(cfg.colorId).hex).lerp(new THREE.Color("#ffffff"), 0.25);
    return new THREE.MeshPhysicalMaterial({
      color: base,
      roughness: gold ? 0.28 : 0.4,
      metalness: gold ? 0.75 : 0.1,
      side: THREE.DoubleSide,
    });
  }, [cfg.border, cfg.colorId]);
  useEffect(() => () => material.dispose(), [material]);
  return material;
}

/* ----------------------- embroidery texture ----------------------- */

export function hasEmbroidery(cfg: DesignConfig): boolean {
  return countEmbroideryChars(cfg) > 0 || !!cfg.logo;
}

function useEmbroideryTexture(
  cfg: DesignConfig,
  width: number,
  height: number,
  band = false
) {
  const [fontsReady, setFontsReady] = useState(false);
  const [logoImg, setLogoImg] = useState<HTMLImageElement | null>(null);
  const logoUrl = cfg.logo?.dataUrl ?? null;

  useEffect(() => {
    let live = true;
    ensureEmbroideryFonts().then(() => live && setFontsReady(true));
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    if (!logoUrl) {
      setLogoImg(null);
      return;
    }
    let live = true;
    const img = new Image();
    img.onload = () => live && setLogoImg(img);
    img.src = logoUrl;
    return () => {
      live = false;
    };
  }, [logoUrl]);

  const key = embroideryKey(cfg);
  const texture = useMemo(() => {
    if (typeof document === "undefined" || !hasEmbroidery(cfg)) return null;
    const canvas = renderEmbroideryCanvas(cfg, {
      width,
      height,
      fabricHex: colorById(cfg.colorId).hex,
      logoImage: logoImg,
      band,
    });
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, logoImg, fontsReady, width, height, band, cfg.colorId]);

  useEffect(() => () => texture?.dispose(), [texture]);
  return texture;
}

/* --------------------- chest decal (robe/cape) --------------------- */

function ChestDecal({
  cfg,
  radius,
  y,
  size,
  thetaOffset = 0,
}: {
  cfg: DesignConfig;
  radius: number;
  y: number;
  size: number;
  thetaOffset?: number;
}) {
  const texture = useEmbroideryTexture(cfg, 1024, 1024);
  const theta = Math.min(1.6, size / radius);
  if (!texture) return null;
  return (
    <mesh position={[0, y, 0]} rotation={[0, thetaOffset, 0]} renderOrder={2}>
      <cylinderGeometry
        args={[radius, radius * 1.03, size, 48, 1, true, -theta / 2, theta]}
      />
      <meshStandardMaterial
        map={texture}
        transparent
        roughness={0.55}
        metalness={threadById(cfg.threadId).metallic ? 0.35 : 0.05}
        polygonOffset
        polygonOffsetFactor={-2}
        side={THREE.FrontSide}
        toneMapped={false}
      />
    </mesh>
  );
}

function DecalGroup({
  cfg,
  radius,
  y,
  size,
}: {
  cfg: DesignConfig;
  radius: number;
  y: number;
  size: number;
}) {
  switch (cfg.position) {
    case "chest-center":
      return <ChestDecal cfg={cfg} radius={radius} y={y} size={size} />;
    case "panel-right":
      return <ChestDecal cfg={cfg} radius={radius} y={y} size={size * 0.72} thetaOffset={0.45} />;
    case "panel-left":
      return <ChestDecal cfg={cfg} radius={radius} y={y} size={size * 0.72} thetaOffset={-0.45} />;
    case "panel-both":
      return (
        <>
          <ChestDecal cfg={cfg} radius={radius} y={y} size={size * 0.68} thetaOffset={0.45} />
          <ChestDecal cfg={cfg} radius={radius} y={y} size={size * 0.68} thetaOffset={-0.45} />
        </>
      );
  }
}

/* ------------------------------ robe ------------------------------ */

function robeProfile(m: Record<string, number>) {
  const H = (m.height ?? 140) / 100;
  const shoulderR = ((m.shoulder ?? 46) / 200) * 0.92;
  const chestR = cmR(m.chest ?? 56);
  const bottomR = cmR((m.bottom ?? 170) / 2);
  const pts: THREE.Vector2[] = [
    new THREE.Vector2(0.056, H + 0.01),
    new THREE.Vector2(0.072, H + 0.005),
    new THREE.Vector2(shoulderR * 0.45, H - 0.008),
    new THREE.Vector2(shoulderR * 0.78, H - 0.04),
    new THREE.Vector2(shoulderR * 0.96, H - 0.085),
    new THREE.Vector2(shoulderR, H - 0.13),
    new THREE.Vector2(Math.max(chestR, shoulderR * 0.88), H - 0.3),
  ];
  const waistY = H * 0.55;
  const waistR = Math.max(chestR * 1.02, shoulderR * 0.82);
  pts.push(new THREE.Vector2(waistR, waistY));
  for (let i = 1; i <= 8; i++) {
    const t = i / 8;
    const r = waistR + (bottomR - waistR) * Math.pow(t, 1.25);
    pts.push(new THREE.Vector2(r, waistY * (1 - t) + 0.025 * t));
  }
  return { pts, H, shoulderR, chestR, bottomR };
}

function Sleeve({
  cfg,
  side,
  H,
  shoulderR,
  material,
}: {
  cfg: DesignConfig;
  side: 1 | -1;
  H: number;
  shoulderR: number;
  material: THREE.Material;
}) {
  const m = cfg.measurements;
  const len = (m.sleeveLen ?? 62) / 100;
  const cuffR = Math.max(0.05, cmR((m.sleeveOpen ?? 48) / 1.6));
  return (
    <group
      position={[side * (shoulderR * 0.72), H - 0.07, 0.012]}
      rotation={[0.1, 0, side * 0.15]}
    >
      {/* gathered shoulder cap blends the sleeve into the body */}
      <mesh material={material} position={[0, -0.012, 0]} scale={[1, 0.6, 1]} castShadow>
        <sphereGeometry args={[0.07, 24, 18]} />
      </mesh>
      <mesh material={material} position={[0, -len / 2, 0]} castShadow>
        <cylinderGeometry args={[0.068, cuffR, len, 32, 10, true]} />
      </mesh>
      {/* cuff rim so the bell reads as an opening */}
      <mesh material={material} position={[0, -len, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[cuffR - 0.004, 0.006, 8, 32]} />
      </mesh>
    </group>
  );
}

/** natural gown pleating — radial folds that deepen toward the hem */
function pleatLathe(g: THREE.LatheGeometry, H: number, depth = 0.006) {
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const r = Math.hypot(x, z);
    if (r < 0.09) continue; // keep the neckline crisp
    const ang = Math.atan2(x, z);
    const hemW = THREE.MathUtils.clamp(1.15 - y / H, 0, 1);
    const pleat =
      (Math.sin(ang * 16) * 0.55 + Math.sin(ang * 7 + 1.7) * 0.45) *
      depth *
      (0.1 + 0.9 * hemW * hemW);
    const nr = r + pleat;
    pos.setXYZ(i, Math.sin(ang) * nr, y, Math.cos(ang) * nr);
  }
  g.computeVertexNormals();
  return g;
}

function Robe({ cfg }: { cfg: DesignConfig }) {
  const material = useFabricMaterial(cfg);
  const trim = useTrimMaterial(cfg);
  const { pts, H, shoulderR, chestR, bottomR } = useMemo(
    () => robeProfile(cfg.measurements),
    [cfg.measurements]
  );
  const geom = useMemo(
    () => pleatLathe(new THREE.LatheGeometry(pts, 128), H),
    [pts, H]
  );
  /* front placket — the classic double pleat band running neck → hem */
  const placketGeom = useMemo(() => {
    const inner = pts.map((p) => new THREE.Vector2(p.x * 1.012 + 0.003, p.y));
    return new THREE.LatheGeometry(inner, 12, -0.09, 0.18);
  }, [pts]);
  useEffect(
    () => () => {
      geom.dispose();
      placketGeom.dispose();
    },
    [geom, placketGeom]
  );

  const decalR = THREE.MathUtils.lerp(shoulderR, chestR, 0.6) + 0.012;

  return (
    <group>
      <mesh geometry={geom} material={material} castShadow receiveShadow />
      <mesh geometry={placketGeom} material={material} />
      <Sleeve cfg={cfg} side={1} H={H} shoulderR={shoulderR} material={material} />
      <Sleeve cfg={cfg} side={-1} H={H} shoulderR={shoulderR} material={material} />

      {/* collar */}
      {cfg.collar !== "classic" && (
        <mesh position={[0, H - 0.005, 0]} rotation={[Math.PI / 2, 0, 0]} material={trim}>
          <torusGeometry args={[0.105, cfg.collar === "shawl" ? 0.028 : 0.014, 16, 48]} />
        </mesh>
      )}
      <mesh position={[0, H + 0.005, 0]} rotation={[Math.PI / 2, 0, 0]} material={material}>
        <torusGeometry args={[0.078, 0.01, 12, 40]} />
      </mesh>

      {/* hem + cuff piping */}
      {cfg.border !== "none" && (
        <mesh position={[0, 0.03, 0]} rotation={[Math.PI / 2, 0, 0]} material={trim}>
          <torusGeometry args={[bottomR - 0.002, 0.008, 10, 72]} />
        </mesh>
      )}

      <DecalGroup cfg={cfg} radius={decalR} y={H - 0.42} size={0.3} />
    </group>
  );
}

/* ------------------------------ cape ------------------------------ */

function Cape({ cfg }: { cfg: DesignConfig }) {
  const material = useFabricMaterial(cfg, 1.4);
  const trim = useTrimMaterial(cfg);
  const m = cfg.measurements;
  const top = 1.46;
  const H = (m.height ?? 100) / 100;
  const neckR = ((m.neck ?? 38) / 100) / (2 * Math.PI) + 0.035;
  const shoulderR = ((m.shoulder ?? 46) / 200) * 0.95;
  const bottomR = ((m.bottom ?? 240) / 100) / (2 * Math.PI);

  const geom = useMemo(() => {
    const pts: THREE.Vector2[] = [new THREE.Vector2(neckR, top)];
    pts.push(new THREE.Vector2(shoulderR, top - 0.09));
    for (let i = 1; i <= 9; i++) {
      const t = i / 9;
      const r = shoulderR + (bottomR - shoulderR) * Math.pow(t, 1.15);
      pts.push(new THREE.Vector2(r, top - 0.09 - (H - 0.09) * t));
    }
    return new THREE.LatheGeometry(pts, 72);
  }, [neckR, shoulderR, bottomR, H]);
  useEffect(() => () => geom.dispose(), [geom]);

  return (
    <group>
      <mesh geometry={geom} material={material} castShadow receiveShadow />
      <mesh position={[0, top + 0.005, 0]} rotation={[Math.PI / 2, 0, 0]} material={trim}>
        <torusGeometry args={[neckR + 0.005, cfg.collar === "shawl" ? 0.03 : 0.016, 14, 48]} />
      </mesh>
      {cfg.border !== "none" && (
        <mesh
          position={[0, top - H + 0.005, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          material={trim}
        >
          <torusGeometry args={[bottomR - 0.002, 0.009, 10, 72]} />
        </mesh>
      )}
      <DecalGroup
        cfg={cfg}
        radius={THREE.MathUtils.lerp(shoulderR, bottomR, 0.22) + 0.012}
        y={top - 0.4}
        size={0.26}
      />
    </group>
  );
}

/* ------------------------------ stole ----------------------------- */

function stolePanelShape(wid: number, len: number, pointed: boolean) {
  const s = new THREE.Shape();
  s.moveTo(-wid / 2, 0);
  s.lineTo(-wid / 2, -len);
  if (pointed) s.lineTo(0, -len - wid * 0.55);
  s.lineTo(wid / 2, -len);
  s.lineTo(wid / 2, 0);
  s.closePath();
  return s;
}

function StolePanel({
  cfg,
  side,
  pointed,
  material,
  trim,
}: {
  cfg: DesignConfig;
  side: 1 | -1;
  pointed: boolean;
  material: THREE.Material;
  trim: THREE.Material;
}) {
  const m = cfg.measurements;
  const wid = (m.width ?? 14) / 100;
  const len = (m.length ?? 80) / 100;

  const geom = useMemo(() => {
    const g = new THREE.ShapeGeometry(stolePanelShape(wid, len, pointed), 4);
    return g;
  }, [wid, len, pointed]);
  useEffect(() => () => geom.dispose(), [geom]);

  const showEmb =
    cfg.position === "panel-both" ||
    (cfg.position === "panel-right" && side === 1) ||
    (cfg.position === "panel-left" && side === -1);

  const texture = useEmbroideryTexture(cfg, 512, 1024);

  return (
    <group
      position={[side * 0.085, 1.425, 0.108]}
      rotation={[-0.045, side * -0.08, side * -0.05]}
    >
      <mesh geometry={geom} material={material} castShadow />
      {/* edge trim */}
      {cfg.border !== "none" && (
        <mesh position={[0, -len - (pointed ? wid * 0.28 : 0), 0.001]} material={trim}>
          <boxGeometry args={[wid * (pointed ? 0.7 : 1.0), 0.012, 0.003]} />
        </mesh>
      )}
      {showEmb && texture && (
        <mesh position={[0, -len * 0.62, 0.004]} renderOrder={2}>
          <planeGeometry args={[wid * 0.94, wid * 1.88]} />
          <meshStandardMaterial
            map={texture}
            transparent
            roughness={0.5}
            metalness={threadById(cfg.threadId).metallic ? 0.3 : 0.05}
            polygonOffset
            polygonOffsetFactor={-2}
            toneMapped={false}
          />
        </mesh>
      )}
    </group>
  );
}

function Stole({ cfg, pointed }: { cfg: DesignConfig; pointed: boolean }) {
  const material = useFabricMaterial(cfg, 0.5);
  const trim = useTrimMaterial(cfg);
  const wid = (cfg.measurements.width ?? 14) / 100;
  return (
    <group>
      {/* neck band */}
      <mesh position={[0, 1.435, 0.02]} rotation={[1.48, 0, Math.PI - 0.55]} material={material}>
        <torusGeometry args={[0.105, wid / 6, 12, 48, Math.PI * 1.35]} />
      </mesh>
      <StolePanel cfg={cfg} side={1} pointed={pointed} material={material} trim={trim} />
      <StolePanel cfg={cfg} side={-1} pointed={pointed} material={material} trim={trim} />
    </group>
  );
}

/* ------------------------------ sash ------------------------------ */

function sashRibbonGeometry(lengthM: number, widthM: number, offset = 0.004, uRange: [number, number] = [0, 1]) {
  const SEG = 160;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const rx = 0.165;
  const rz = 0.125;
  const topY = 1.44;
  const drop = Math.min(0.85, lengthM / 2.1);

  const pointAt = (t: number) => {
    const phi = t * Math.PI * 2 + 0.5;
    const y = topY - drop * Math.sin(Math.PI * t);
    return new THREE.Vector3(rx * Math.sin(phi), y, rz * Math.cos(phi));
  };

  const [u0, u1] = uRange;
  for (let i = 0; i <= SEG; i++) {
    const t = u0 + (u1 - u0) * (i / SEG);
    const p = pointAt(t);
    const ahead = pointAt(Math.min(1, t + 0.004));
    const tangent = ahead.clone().sub(p).normalize();
    const outward = new THREE.Vector3(p.x / rx, 0, p.z / rz).normalize();
    const across = new THREE.Vector3().crossVectors(outward, tangent).normalize();
    const half = across.multiplyScalar(widthM / 2);
    const out = outward.multiplyScalar(offset);
    const a = p.clone().add(half).add(out);
    const b = p.clone().sub(half).add(out);
    positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
    uvs.push(i / SEG, 1, i / SEG, 0);
    if (i < SEG) {
      const k = i * 2;
      indices.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(indices);
  g.computeVertexNormals();
  return g;
}

function Sash({ cfg }: { cfg: DesignConfig }) {
  const material = useFabricMaterial(cfg, 0.3);
  const m = cfg.measurements;
  const len = (m.length ?? 170) / 100;
  const wid = (m.width ?? 10) / 100;

  const geom = useMemo(() => sashRibbonGeometry(len, wid), [len, wid]);
  const embGeom = useMemo(
    () => sashRibbonGeometry(len, wid * 0.92, 0.009, [0.02, 0.34]),
    [len, wid]
  );
  useEffect(() => () => { geom.dispose(); embGeom.dispose(); }, [geom, embGeom]);

  const texture = useEmbroideryTexture(cfg, 2048, 256, true);

  return (
    <group>
      <mesh geometry={geom} material={material} castShadow />
      {texture && (
        <mesh geometry={embGeom} renderOrder={2}>
          <meshStandardMaterial
            map={texture}
            transparent
            roughness={0.5}
            metalness={threadById(cfg.threadId).metallic ? 0.3 : 0.05}
            side={THREE.DoubleSide}
            polygonOffset
            polygonOffsetFactor={-2}
            toneMapped={false}
          />
        </mesh>
      )}
      {/* rosette at the hip */}
      <mesh position={[-0.145, 0.72, 0.06]} material={material}>
        <sphereGeometry args={[wid * 0.55, 20, 20]} />
      </mesh>
    </group>
  );
}

/* ------------------------- atelier bust ---------------------------- */
/* The display mannequin from the boutique — garments drape on it,     */
/* and the mortarboard rests on the neck exactly like in the shop.     */

function Bust({ neckBase, torso }: { neckBase: number; torso: boolean }) {
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#2a272e",
        roughness: 0.62,
        metalness: 0.05,
      }),
    []
  );
  const torsoGeom = useMemo(() => {
    if (!torso) return null;
    const pts = [
      new THREE.Vector2(0.052, 1.47),
      new THREE.Vector2(0.09, 1.44),
      new THREE.Vector2(0.155, 1.395),
      new THREE.Vector2(0.185, 1.32),
      new THREE.Vector2(0.178, 1.18),
      new THREE.Vector2(0.152, 1.04),
      new THREE.Vector2(0.128, 0.97),
      new THREE.Vector2(0.0, 0.955),
    ];
    return new THREE.LatheGeometry(pts, 48);
  }, [torso]);
  useEffect(
    () => () => {
      mat.dispose();
      torsoGeom?.dispose();
    },
    [mat, torsoGeom]
  );
  return (
    <group>
      <mesh material={mat} position={[0, neckBase + 0.045, 0]}>
        <cylinderGeometry args={[0.041, 0.05, 0.1, 24]} />
      </mesh>
      <mesh material={mat} position={[0, neckBase + 0.095, 0]} scale={[1, 0.5, 1]}>
        <sphereGeometry args={[0.041, 24, 16]} />
      </mesh>
      {torsoGeom && (
        <mesh geometry={torsoGeom} material={mat} scale={[0.9, 1, 0.52]} receiveShadow />
      )}
    </group>
  );
}

/* --------------------------- mortarboard --------------------------- */

function Mortarboard({ cfg, y }: { cfg: DesignConfig; y: number }) {
  const material = useFabricMaterial(cfg, 0);
  const gold = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(threadById(cfg.threadId).hex),
        roughness: 0.3,
        metalness: 0.7,
      }),
    [cfg.threadId]
  );
  useEffect(() => () => gold.dispose(), [gold]);

  return (
    <group position={[0, y, 0]} rotation={[0.05, 0.35, -0.03]}>
      {/* rounded padded crown */}
      <mesh material={material} position={[0, 0.012, 0]} scale={[1, 0.55, 1]} castShadow>
        <sphereGeometry args={[0.105, 32, 24]} />
      </mesh>
      {/* headband rim */}
      <mesh material={material} position={[0, -0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.094, 0.013, 12, 40]} />
      </mesh>
      {/* board */}
      <mesh position={[0, 0.062, 0]} rotation={[0, Math.PI / 4, 0]} material={material} castShadow>
        <boxGeometry args={[0.36, 0.016, 0.36]} />
      </mesh>
      {/* covered center button with gold cord ring */}
      <mesh position={[0, 0.073, 0]} material={material}>
        <cylinderGeometry args={[0.027, 0.031, 0.01, 20]} />
      </mesh>
      <mesh position={[0, 0.079, 0]} scale={[1, 0.5, 1]} material={material}>
        <sphereGeometry args={[0.025, 20, 12]} />
      </mesh>
      <mesh position={[0, 0.077, 0]} rotation={[Math.PI / 2, 0, 0]} material={gold}>
        <torusGeometry args={[0.033, 0.0032, 8, 36]} />
      </mesh>
      {cfg.accessories.tassel && (
        <group>
          {/* cord knot on the button */}
          <mesh position={[0, 0.085, 0]} material={gold}>
            <sphereGeometry args={[0.009, 14, 14]} />
          </mesh>
          {/* cord lying across the board, button → edge */}
          <mesh position={[0.062, 0.074, 0.062]} rotation={[0, -Math.PI / 4, Math.PI / 2 - 0.06]} material={gold}>
            <cylinderGeometry args={[0.0026, 0.0026, 0.17, 8]} />
          </mesh>
          {/* cord falling over the edge */}
          <mesh position={[0.128, 0.022, 0.128]} rotation={[0.22, 0, -0.22]} material={gold}>
            <cylinderGeometry args={[0.0026, 0.0026, 0.105, 8]} />
          </mesh>
          {/* tassel neck, head and fringe */}
          <mesh position={[0.138, -0.038, 0.138]} material={gold}>
            <sphereGeometry args={[0.0085, 14, 14]} />
          </mesh>
          <mesh position={[0.138, -0.06, 0.138]} material={gold}>
            <cylinderGeometry args={[0.0075, 0.0125, 0.038, 14]} />
          </mesh>
          <mesh position={[0.138, -0.096, 0.138]} material={gold}>
            <cylinderGeometry args={[0.0125, 0.008, 0.04, 14]} />
          </mesh>
        </group>
      )}
    </group>
  );
}

/* ------------------------------ root ------------------------------ */

export default function Garment({ cfg }: { cfg: DesignConfig }) {
  /* the mannequin neck starts at the garment's collar; the cap rests on it */
  const neckBase =
    cfg.product === "robe"
      ? (cfg.measurements.height ?? 140) / 100 + 0.005
      : cfg.product === "cape"
        ? 1.462
        : 1.43;
  const capY = neckBase + 0.155;
  const showTorso = cfg.product !== "robe" && cfg.product !== "cape";

  return (
    <group>
      <Bust neckBase={neckBase} torso={showTorso} />
      {cfg.product === "robe" && <Robe cfg={cfg} />}
      {cfg.product === "cape" && <Cape cfg={cfg} />}
      {cfg.product === "stole-american" && <Stole cfg={cfg} pointed />}
      {cfg.product === "stole-european" && <Stole cfg={cfg} pointed={false} />}
      {cfg.product === "sash" && <Sash cfg={cfg} />}
      {cfg.accessories.cap && <Mortarboard cfg={cfg} y={capY} />}
    </group>
  );
}
