import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import {
  ACESFilmicToneMapping,
  Box3,
  type Material,
  Mesh,
  PCFShadowMap,
  PerspectiveCamera,
  PMREMGenerator,
  Vector3,
} from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { assetUrl } from "../../../utils/assetUrl";

export type ProductSequence = {
  bottle: number;
  capsule: number;
  pairAlignment: number;
  rotation: number;
};
type Props = {
  sequence: ProductSequence;
  onReady: () => void;
  onError: () => void;
};
type FadeMaterial = {
  material: Material;
  opacity: number;
  transparent: boolean;
  depthWrite: boolean;
};
const modelUrl = assetUrl("assets/product/product.glb");

// eslint-disable-next-line react-refresh/only-export-components -- Called only after the renderer's deferred import.
export function preloadProductModel() {
  useGLTF.preload(modelUrl);
}

function ProductScene({ sequence, onReady, onError }: Props) {
  const { scene: source } = useGLTF(modelUrl);
  const { gl, scene, camera, size, invalidate } = useThree();
  const fadeMaterials = useRef<{
    bottle: FadeMaterial[];
    capsule: FadeMaterial[];
  }>({
    bottle: [],
    capsule: [],
  });
  const model = useMemo(() => {
    const object = source.clone(true);
    const carton = object.getObjectByName("Carton");
    const bottle = object.getObjectByName("Bottle");
    const capsule = object.getObjectByName("Capsule");
    if (!carton || !bottle || !capsule) {
      throw new Error("The product model is missing a packaging group.");
    }
    const bounds = new Box3().setFromObject(object);
    const center = bounds.getCenter(new Vector3());
    const cartonBounds = new Box3().setFromObject(carton);
    const cartonCenter = cartonBounds.getCenter(new Vector3());
    const pairCenter = cartonBounds
      .clone()
      .union(new Box3().setFromObject(bottle))
      .getCenter(new Vector3());
    const extent = bounds.getSize(new Vector3());
    const scale = 3 / Math.max(extent.x, extent.y, extent.z);
    object.position.sub(new Vector3(center.x, bounds.min.y, center.z));
    object.traverse((node) => {
      if (node instanceof Mesh) {
        node.castShadow = !node.userData.printedSurface;
        node.receiveShadow = true;
      }
    });
    return {
      object,
      parts: { carton, bottle, capsule },
      center,
      cartonCenter,
      pairCenter,
      ground: bounds.min.y,
      scale,
      height: extent.y * scale,
      radius: (extent.length() * scale) / 2,
    };
  }, [source]);

  useLayoutEffect(() => {
    const copies: Material[] = [];
    const originals: Array<[Mesh, Material | Material[]]> = [];
    fadeMaterials.current = { bottle: [], capsule: [] };
    for (const [part, group] of Object.entries(model.parts)) {
      // Separate copies per part prevent one shared ink material fading its neighbours.
      const materials = new Map<string, Material>();
      group.traverse((node) => {
        if (!(node instanceof Mesh)) return;
        originals.push([node, node.material]);
        const copyMaterial = (sourceMaterial: Material) => {
          const key = `${sourceMaterial.uuid}:${Boolean(node.userData.printedSurface)}`;
          let material = materials.get(key);
          if (!material) {
            material = sourceMaterial.clone();
            materials.set(key, material);
            copies.push(material);
            if (part === "bottle" || part === "capsule") {
              fadeMaterials.current[part].push({
                material,
                opacity: material.opacity,
                transparent: material.transparent,
                depthWrite: material.depthWrite,
              });
            }
          }
          if (node.userData.printedSurface) {
            material.polygonOffset = true;
            material.polygonOffsetFactor = -1;
            material.polygonOffsetUnits = -1;
          }
          return material;
        };
        node.material = Array.isArray(node.material)
          ? node.material.map(copyMaterial)
          : copyMaterial(node.material);
      });
    }
    invalidate();
    return () => {
      for (const [mesh, original] of originals) mesh.material = original;
      for (const material of copies) material.dispose();
      fadeMaterials.current = { bottle: [], capsule: [] };
    };
  }, [model, invalidate]);

  useLayoutEffect(() => {
    for (const part of ["bottle", "capsule"] as const) {
      const reveal = sequence[part];
      model.parts[part].visible = reveal > 0;
      model.parts[part].traverse((node) => {
        if (node instanceof Mesh) {
          node.castShadow = reveal > 0.98 && !node.userData.printedSurface;
        }
      });
      for (const saved of fadeMaterials.current[part]) {
        const transparent = saved.transparent || reveal < 1;
        if (saved.material.transparent !== transparent) {
          saved.material.transparent = transparent;
          saved.material.needsUpdate = true;
        }
        saved.material.opacity = saved.opacity * reveal;
        saved.material.depthWrite = saved.depthWrite && reveal > 0.98;
      }
    }
    // Keep the visible assembly centred while each original part joins it.
    const center = model.cartonCenter
      .clone()
      .lerp(model.pairCenter, sequence.pairAlignment)
      .lerp(model.center, sequence.capsule);
    model.object.position.set(-center.x, -model.ground, -center.z);
    invalidate();
  }, [sequence, model, invalidate]);

  useLayoutEffect(() => {
    const perspective = camera as PerspectiveCamera;
    const halfFov = (perspective.fov * Math.PI) / 360;
    const limitingFov = Math.min(
      halfFov,
      Math.atan((Math.tan(halfFov) * size.width) / size.height),
    );
    // The restrained turn allows a closer frame while keeping all original parts intact.
    const distance = (model.radius / Math.sin(limitingFov)) * 0.84;
    perspective.position.set(0, model.height * 0.5 + distance * 0.23, distance);
    perspective.lookAt(0, model.height * 0.5, 0);
    perspective.updateProjectionMatrix();
    invalidate();
  }, [camera, size.width, size.height, model, invalidate]);

  useEffect(() => {
    const generator = new PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const environment = generator.fromScene(room, 0.04);
    scene.environment = environment.texture;
    scene.environmentIntensity = 0.45;
    room.dispose();
    generator.dispose();
    const onLost = (event: Event) => {
      event.preventDefault();
      onError();
    };
    gl.domElement.addEventListener("webglcontextlost", onLost);
    invalidate();
    let secondFrame = 0;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(onReady);
    });
    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
      gl.domElement.removeEventListener("webglcontextlost", onLost);
      scene.environment = null;
      environment.dispose();
    };
  }, [gl, scene, invalidate, onReady, onError]);

  return (
    <>
      <directionalLight
        position={[-3, 12, 6]}
        color="#fffaf0"
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-radius={4}
        shadow-bias={-0.00004}
        shadow-normalBias={0.00015 * model.scale}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
        shadow-camera-near={0.3}
        shadow-camera-far={21}
      />
      <directionalLight position={[4, 3, -3]} color="#eef3ff" intensity={0.3} />
      <group rotation={[0, -Math.PI / 7 + sequence.rotation, 0]}>
        <group scale={model.scale}>
          <primitive object={model.object} dispose={null} />
        </group>
      </group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.002, 0]}
        receiveShadow
      >
        <planeGeometry args={[30, 30]} />
        <shadowMaterial transparent opacity={0.13} />
      </mesh>
    </>
  );
}

export default function ProductModel(props: Props) {
  return (
    <Canvas
      shadows={{ type: PCFShadowMap }}
      frameloop="demand"
      dpr={[1, 1.5]}
      camera={{ fov: 32, near: 0.1, far: 40 }}
      gl={{
        alpha: true,
        antialias: true,
        toneMapping: ACESFilmicToneMapping,
        toneMappingExposure: 0.95,
      }}
      fallback={null}
    >
      <Suspense fallback={null}>
        <ProductScene {...props} />
      </Suspense>
    </Canvas>
  );
}
