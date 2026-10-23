import * as THREE from 'three';

export interface PieceMaterials {
  base: THREE.Material;
  body: THREE.Material;
  accent: THREE.Material;
  gold: THREE.Material;
  cloth: THREE.Material;
  glow: THREE.Material;
  armor: THREE.Material;
}

export class ChessPieceBuilder {
  private static getMaterials(color: 'w' | 'b'): PieceMaterials {
    if (color === 'w') {
      return {
        base: new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.2, metalness: 0.8 }), // Pearl White
        body: new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3, metalness: 0.2 }),
        accent: new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.4, metalness: 0.1 }), // Rose gold/velvet
        gold: new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.2, metalness: 0.9 }), // Metallic Gold
        cloth: new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.6 }), // Sky Blue / Silk
        glow: new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.8 }),
        armor: new THREE.MeshStandardMaterial({ color: 0xc084fc, roughness: 0.3, metalness: 0.8 })
      };
    } else {
      return {
        base: new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.9 }), // Obsidian/Granite
        body: new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.5 }), // Dark Slate / Gunmetal
        accent: new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.5 }), // Crimson velvet
        gold: new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.2, metalness: 0.9 }), // Antique Gold
        cloth: new THREE.MeshStandardMaterial({ color: 0x581c87, roughness: 0.6 }), // Deep Violet
        glow: new THREE.MeshBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.8 }),
        armor: new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.2, metalness: 0.9 }) // Iron / Steel
      };
    }
  }

  /**
   * Builds piece sitting on a circular coin base
   */
  static buildPiece(type: 'p' | 'r' | 'n' | 'b' | 'q' | 'k', color: 'w' | 'b'): THREE.Group {
    const group = new THREE.Group();
    const mats = this.getMaterials(color);

    // 1. Circular Coin Base (Common to all pieces)
    const baseGeo = new THREE.CylinderGeometry(0.42, 0.45, 0.12, 32);
    const baseMesh = new THREE.Mesh(baseGeo, mats.base);
    baseMesh.position.y = 0.06;
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    group.add(baseMesh);

    // Base trim ring
    const ringGeo = new THREE.TorusGeometry(0.43, 0.02, 16, 32);
    ringGeo.rotateX(Math.PI / 2);
    const ringMesh = new THREE.Mesh(ringGeo, mats.gold);
    ringMesh.position.y = 0.11;
    group.add(ringMesh);

    // 2. Specific 3D Character geometry
    const charGroup = new THREE.Group();
    charGroup.position.y = 0.12;

    switch (type) {
      case 'k': // King 👑 Royal Monarch with Crown, Scepter, Cape, Throne
        this.buildKing(charGroup, mats);
        break;
      case 'q': // Queen 👸 Empress/Sorceress with tiara, flowing dress, orb
        this.buildQueen(charGroup, mats);
        break;
      case 'r': // Rook 🐘 War Elephant with tower on back & armored tusks
        this.buildRook(charGroup, mats);
        break;
      case 'b': // Bishop 🧙 Wizard with pointed hat, glowing staff orb, long beard
        this.buildBishop(charGroup, mats);
        break;
      case 'n': // Knight 🐴 Rearing Warhorse with barding armor and head plume
        this.buildKnight(charGroup, mats);
        break;
      case 'p': // Pawn 🛡️ Foot soldier with shield, helmet, spear
        this.buildPawn(charGroup, mats);
        break;
    }

    group.add(charGroup);
    group.userData = { pieceType: type, pieceColor: color, charGroup };
    return group;
  }

  private static buildKing(parent: THREE.Group, mats: PieceMaterials) {
    // Throne/Pedestal Base
    const throneGeo = new THREE.CylinderGeometry(0.3, 0.38, 0.25, 8);
    const throne = new THREE.Mesh(throneGeo, mats.body);
    throne.position.y = 0.125;
    parent.add(throne);

    // Robed Body
    const robeGeo = new THREE.CylinderGeometry(0.2, 0.32, 0.6, 16);
    const robe = new THREE.Mesh(robeGeo, mats.accent); // Velvet Robe
    robe.position.y = 0.55;
    parent.add(robe);

    // Flowing Cape
    const capeGeo = new THREE.CylinderGeometry(0.22, 0.34, 0.58, 16, 1, false, 0, Math.PI);
    const cape = new THREE.Mesh(capeGeo, mats.accent);
    cape.position.set(0, 0.54, 0.02);
    cape.name = 'cape';
    parent.add(cape);

    // Head
    const headGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const head = new THREE.Mesh(headGeo, mats.body);
    head.position.y = 0.92;
    parent.add(head);

    // Crown
    const crownGeo = new THREE.CylinderGeometry(0.16, 0.12, 0.15, 8);
    const crown = new THREE.Mesh(crownGeo, mats.gold);
    crown.position.y = 1.05;
    crown.name = 'crown';
    parent.add(crown);

    // Crown Cross / Orb
    const crossGeo = new THREE.BoxGeometry(0.04, 0.1, 0.04);
    const cross = new THREE.Mesh(crossGeo, mats.gold);
    cross.position.y = 1.15;
    parent.add(cross);

    // Scepter in right hand
    const scepterStaff = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.6), mats.gold);
    scepterStaff.position.set(0.18, 0.7, 0.08);
    scepterStaff.rotation.z = -0.2;
    parent.add(scepterStaff);

    const scepterOrb = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 12), mats.glow);
    scepterOrb.position.set(0.24, 0.98, 0.08);
    parent.add(scepterOrb);
  }

  private static buildQueen(parent: THREE.Group, mats: PieceMaterials) {
    // Flowing Gown/Dress
    const dressGeo = new THREE.ConeGeometry(0.35, 0.8, 16);
    const dress = new THREE.Mesh(dressGeo, mats.cloth);
    dress.position.y = 0.4;
    parent.add(dress);

    // Upper Torso
    const torsoGeo = new THREE.CylinderGeometry(0.12, 0.18, 0.35, 16);
    const torso = new THREE.Mesh(torsoGeo, mats.body);
    torso.position.y = 0.85;
    parent.add(torso);

    // Head
    const headGeo = new THREE.SphereGeometry(0.1, 16, 16);
    const head = new THREE.Mesh(headGeo, mats.body);
    head.position.y = 1.08;
    parent.add(head);

    // Tiara
    const tiaraGeo = new THREE.ConeGeometry(0.13, 0.15, 6);
    const tiara = new THREE.Mesh(tiaraGeo, mats.gold);
    tiara.position.y = 1.18;
    parent.add(tiara);

    // Floating Magical Orb in hand
    const orbGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const orb = new THREE.Mesh(orbGeo, mats.glow);
    orb.position.set(0.18, 0.9, 0.15);
    orb.name = 'magicOrb';
    parent.add(orb);

    // Sparkle Aura Ring around orb
    const ringGeo = new THREE.TorusGeometry(0.12, 0.01, 8, 16);
    const auraRing = new THREE.Mesh(ringGeo, mats.gold);
    auraRing.position.set(0.18, 0.9, 0.15);
    auraRing.name = 'auraRing';
    parent.add(auraRing);
  }

  private static buildRook(parent: THREE.Group, mats: PieceMaterials) {
    // Elephant Body
    const bodyGeo = new THREE.BoxGeometry(0.45, 0.35, 0.6);
    const body = new THREE.Mesh(bodyGeo, mats.body);
    body.position.y = 0.3;
    parent.add(body);

    // Elephant Head
    const headGeo = new THREE.BoxGeometry(0.3, 0.28, 0.28);
    const head = new THREE.Mesh(headGeo, mats.body);
    head.position.set(0, 0.38, 0.38);
    parent.add(head);

    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.04, 0.07, 0.3, 8);
    const trunk = new THREE.Mesh(trunkGeo, mats.body);
    trunk.position.set(0, 0.25, 0.52);
    trunk.rotation.x = -0.5;
    trunk.name = 'trunk';
    parent.add(trunk);

    // Armored Tusks
    const tuskLeft = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.25, 8), mats.armor);
    tuskLeft.position.set(-0.12, 0.28, 0.5);
    tuskLeft.rotation.x = 1.2;
    parent.add(tuskLeft);

    const tuskRight = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.25, 8), mats.armor);
    tuskRight.position.set(0.12, 0.28, 0.5);
    tuskRight.rotation.x = 1.2;
    parent.add(tuskRight);

    // Castle Tower Howdah on Back
    const towerGeo = new THREE.CylinderGeometry(0.28, 0.3, 0.4, 8);
    const tower = new THREE.Mesh(towerGeo, mats.armor);
    tower.position.set(0, 0.65, -0.05);
    parent.add(tower);

    // Castle Battlements (Parapet)
    const topGeo = new THREE.CylinderGeometry(0.32, 0.28, 0.12, 8);
    const top = new THREE.Mesh(topGeo, mats.gold);
    top.position.set(0, 0.88, -0.05);
    parent.add(top);

    // Flag on tower
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.3), mats.gold);
    pole.position.set(0, 1.05, -0.05);
    parent.add(pole);

    const flag = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.08, 0.01), mats.accent);
    flag.position.set(0.08, 1.15, -0.05);
    flag.name = 'flag';
    parent.add(flag);
  }

  private static buildBishop(parent: THREE.Group, mats: PieceMaterials) {
    // Wizard Robe
    const robeGeo = new THREE.CylinderGeometry(0.15, 0.32, 0.75, 16);
    const robe = new THREE.Mesh(robeGeo, mats.cloth);
    robe.position.y = 0.375;
    parent.add(robe);

    // Head & Beard
    const headGeo = new THREE.SphereGeometry(0.1, 16, 16);
    const head = new THREE.Mesh(headGeo, mats.body);
    head.position.y = 0.82;
    parent.add(head);

    const beardGeo = new THREE.ConeGeometry(0.08, 0.22, 8);
    const beard = new THREE.Mesh(beardGeo, mats.base);
    beard.position.set(0, 0.72, 0.08);
    beard.rotation.x = 0.3;
    parent.add(beard);

    // Pointed Wizard Hat
    const hatBaseGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.03, 16);
    const hatBase = new THREE.Mesh(hatBaseGeo, mats.cloth);
    hatBase.position.y = 0.9;
    parent.add(hatBase);

    const hatConeGeo = new THREE.ConeGeometry(0.16, 0.45, 12);
    const hatCone = new THREE.Mesh(hatConeGeo, mats.cloth);
    hatCone.position.set(0, 1.12, -0.03);
    hatCone.rotation.x = -0.15;
    parent.add(hatCone);

    // Staff with Glowing Orb
    const staffGeo = new THREE.CylinderGeometry(0.015, 0.02, 0.9, 8);
    const staff = new THREE.Mesh(staffGeo, mats.gold);
    staff.position.set(0.18, 0.55, 0.1);
    parent.add(staff);

    const orbGeo = new THREE.SphereGeometry(0.07, 12, 12);
    const orb = new THREE.Mesh(orbGeo, mats.glow);
    orb.position.set(0.18, 1.02, 0.1);
    orb.name = 'staffOrb';
    parent.add(orb);
  }

  private static buildKnight(parent: THREE.Group, mats: PieceMaterials) {
    // Rearing Warhorse Body
    const bodyGeo = new THREE.CylinderGeometry(0.18, 0.25, 0.5, 12);
    const body = new THREE.Mesh(bodyGeo, mats.armor); // Barding armor
    body.position.set(0, 0.35, -0.05);
    body.rotation.x = -0.4; // Rearing stance
    parent.add(body);

    // Neck & Head
    const neckGeo = new THREE.CylinderGeometry(0.12, 0.16, 0.4, 12);
    const neck = new THREE.Mesh(neckGeo, mats.armor);
    neck.position.set(0, 0.62, 0.1);
    neck.rotation.x = 0.4;
    parent.add(neck);

    const headGeo = new THREE.BoxGeometry(0.14, 0.18, 0.3);
    const head = new THREE.Mesh(headGeo, mats.armor);
    head.position.set(0, 0.8, 0.22);
    head.rotation.x = 0.2;
    parent.add(head);

    // Ears
    const earL = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.1, 4), mats.armor);
    earL.position.set(-0.06, 0.92, 0.18);
    parent.add(earL);

    const earR = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.1, 4), mats.armor);
    earR.position.set(0.06, 0.92, 0.18);
    parent.add(earR);

    // Helmet Plume / Mane
    const plumeGeo = new THREE.ConeGeometry(0.06, 0.3, 8);
    const plume = new THREE.Mesh(plumeGeo, mats.accent);
    plume.position.set(0, 0.95, 0.08);
    plume.rotation.x = -0.6;
    plume.name = 'plume';
    parent.add(plume);
  }

  private static buildPawn(parent: THREE.Group, mats: PieceMaterials) {
    // Foot Soldier Torso (Chainmail)
    const torsoGeo = new THREE.CylinderGeometry(0.15, 0.22, 0.45, 12);
    const torso = new THREE.Mesh(torsoGeo, mats.armor);
    torso.position.y = 0.25;
    parent.add(torso);

    // Helmet Head
    const headGeo = new THREE.SphereGeometry(0.11, 12, 12);
    const head = new THREE.Mesh(headGeo, mats.body);
    head.position.y = 0.54;
    parent.add(head);

    const helmetGeo = new THREE.ConeGeometry(0.13, 0.15, 12);
    const helmet = new THREE.Mesh(helmetGeo, mats.armor);
    helmet.position.y = 0.62;
    parent.add(helmet);

    // Shield on left arm
    const shieldGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.03, 16);
    shieldGeo.rotateX(Math.PI / 2);
    const shield = new THREE.Mesh(shieldGeo, mats.accent);
    shield.position.set(-0.18, 0.38, 0.1);
    shield.name = 'shield';
    parent.add(shield);

    // Spear on right hand
    const spearPole = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.75), mats.body);
    spearPole.position.set(0.16, 0.42, 0.05);
    parent.add(spearPole);

    const spearTip = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.12, 8), mats.gold);
    spearTip.position.set(0.16, 0.82, 0.05);
    parent.add(spearTip);
  }
}
