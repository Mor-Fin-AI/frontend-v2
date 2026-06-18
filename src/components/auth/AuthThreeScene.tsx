"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useTheme } from "@/context/ThemeContext";

type AuthThreeSceneProps = {
  className?: string;
};

function readThemeColors(isDark: boolean) {
  return {
    background: isDark ? 0x0a0f14 : 0xf4f7fa,
    primary: isDark ? 0x22c38e : 0x1a9d6f,
    accent: isDark ? 0x30abe8 : 0x2088c4,
    particle: isDark ? 0x8fd4ff : 0x5a8fb8,
    wire: isDark ? 0x22c38e : 0x30abe8,
  };
}

export function AuthThreeScene({ className }: AuthThreeSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isDark } = useTheme();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const colors = readThemeColors(isDark);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(colors.background, 8, 22);

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0.4, 6.2);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(colors.background, 0);
    container.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, isDark ? 0.45 : 0.65);
    scene.add(ambient);

    const keyLight = new THREE.PointLight(colors.primary, isDark ? 2.2 : 1.4, 24);
    keyLight.position.set(3, 4, 5);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(colors.accent, isDark ? 1.8 : 1.1, 20);
    rimLight.position.set(-4, -2, 3);
    scene.add(rimLight);

    const coreGeometry = new THREE.TorusKnotGeometry(1.05, 0.28, 180, 24);
    const coreMaterial = new THREE.MeshPhysicalMaterial({
      color: colors.primary,
      emissive: colors.primary,
      emissiveIntensity: isDark ? 0.35 : 0.18,
      metalness: 0.72,
      roughness: 0.22,
      clearcoat: 0.85,
      clearcoatRoughness: 0.12,
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(core);

    const shellGeometry = new THREE.IcosahedronGeometry(2.15, 1);
    const shellMaterial = new THREE.MeshBasicMaterial({
      color: colors.wire,
      wireframe: true,
      transparent: true,
      opacity: isDark ? 0.28 : 0.22,
    });
    const shell = new THREE.Mesh(shellGeometry, shellMaterial);
    scene.add(shell);

    const orbitGroup = new THREE.Group();
    scene.add(orbitGroup);

    const orbitSpheres: THREE.Mesh[] = [];
    const orbitConfigs = [
      { radius: 2.8, speed: 0.55, size: 0.14, phase: 0 },
      { radius: 3.2, speed: -0.42, size: 0.11, phase: 1.4 },
      { radius: 2.45, speed: 0.68, size: 0.1, phase: 2.6 },
    ];

    for (const config of orbitConfigs) {
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(config.size, 24, 24),
        new THREE.MeshStandardMaterial({
          color: colors.accent,
          emissive: colors.accent,
          emissiveIntensity: isDark ? 0.55 : 0.28,
          metalness: 0.6,
          roughness: 0.25,
        })
      );
      orbitGroup.add(sphere);
      orbitSpheres.push(sphere);
      (sphere.userData as { config: typeof config }).config = config;
    }

    const particleCount = 320;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let index = 0; index < particleCount; index += 1) {
      particlePositions[index * 3] = (Math.random() - 0.5) * 18;
      particlePositions[index * 3 + 1] = (Math.random() - 0.5) * 12;
      particlePositions[index * 3 + 2] = (Math.random() - 0.5) * 14;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3)
    );

    const particles = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({
        color: colors.particle,
        size: isDark ? 0.045 : 0.035,
        transparent: true,
        opacity: isDark ? 0.75 : 0.55,
        depthWrite: false,
      })
    );
    scene.add(particles);

    let targetRotationX = 0;
    let targetRotationY = 0;
    let animationFrame = 0;
    let elapsed = 0;

    const handlePointerMove = (event: PointerEvent) => {
      if (prefersReducedMotion) return;

      const rect = container.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      targetRotationY = x * 0.45;
      targetRotationX = y * 0.28;
    };

    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width === 0 || height === 0) return;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    container.addEventListener("pointermove", handlePointerMove);

    const animate = (time: number) => {
      animationFrame = window.requestAnimationFrame(animate);
      elapsed = time * 0.001;

      if (!prefersReducedMotion) {
        core.rotation.x = elapsed * 0.28 + targetRotationX;
        core.rotation.y = elapsed * 0.42 + targetRotationY;
        shell.rotation.x = -elapsed * 0.12 + targetRotationX * 0.35;
        shell.rotation.y = elapsed * 0.18 + targetRotationY * 0.35;

        orbitSpheres.forEach((sphere, index) => {
          const config = (sphere.userData as { config: (typeof orbitConfigs)[number] })
            .config;
          const angle = elapsed * config.speed + config.phase;
          sphere.position.set(
            Math.cos(angle) * config.radius,
            Math.sin(angle * 1.3 + index) * 0.55,
            Math.sin(angle) * config.radius
          );
        });

        particles.rotation.y = elapsed * 0.03;
        camera.position.x += (targetRotationY * 1.4 - camera.position.x) * 0.04;
        camera.position.y += (0.4 - targetRotationX * 0.8 - camera.position.y) * 0.04;
        camera.lookAt(0, 0, 0);
      }

      renderer.render(scene, camera);
    };

    animationFrame = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      container.removeEventListener("pointermove", handlePointerMove);
      resizeObserver.disconnect();

      coreGeometry.dispose();
      coreMaterial.dispose();
      shellGeometry.dispose();
      shellMaterial.dispose();
      particleGeometry.dispose();
      (particles.material as THREE.Material).dispose();

      orbitSpheres.forEach((sphere) => {
        sphere.geometry.dispose();
        (sphere.material as THREE.Material).dispose();
      });

      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isDark]);

  return (
    <div
      ref={containerRef}
      className={className}
      aria-hidden
    />
  );
}
