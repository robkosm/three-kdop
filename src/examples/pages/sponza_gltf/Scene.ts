import * as THREE from "three";

import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import { GUI } from "dat.gui";

import DOPHelper from "../../../DOPHelper";
import DOP from "../../../DOP";

export default class SponzaDemoScene extends THREE.Scene {
    private readonly gltfLoader = new GLTFLoader();

    gui: GUI;

    k: number;
    DOPHelpers: DOPHelper[];

    constructor() {
        super();
        this.k = 26;
        this.gui = new GUI();
        this.DOPHelpers = [];
    }

    async initialize(callback: () => void) {
        // this.background = new THREE.Color(0xf1f1f1);
        this.background = new THREE.Color(0x10101a);

        // {
        //     const gridHelper = new THREE.GridHelper(
        //         1,
        //         100,
        //         new THREE.Color(0x555566),
        //         new THREE.Color(0x303040)
        //     );
        //     this.add(gridHelper);
        // }
        // {
        //     const gridHelper = new THREE.GridHelper(
        //         1,
        //         10,
        //         new THREE.Color(0x555566),
        //         new THREE.Color(0x484858)
        //     );
        //     this.add(gridHelper);
        // }

        this.initializeGUI();

        const meshFolder = this.gui.addFolder("meshes and groups");

        // Load a glTF resource
        this.gltfLoader.load(
            // resource URL
            "assets/sponza/glTF/Sponza.gltf",
            // called when the resource is loaded
            (gltf) => {
                console.log(gltf.scene);
                gltf.scene.traverse((o) => {
                    if (o instanceof THREE.Mesh) {
                        const dop = new DOP(26);
                        dop.setFromObject(o);
                        const dopHelper = new DOPHelper(dop);
                        const folder = meshFolder.addFolder(
                            "mesh " + Math.random().toString(36).slice(2, 5)
                        );
                        folder.add(o, "visible").name("mesh visible");
                        folder.add(dopHelper, "visible").name("helper visible");
                        this.add(dopHelper);
                        this.DOPHelpers.push(dopHelper);

                        o.visible = false;
                    } else {
                        const dop = new DOP(26);
                        dop.setFromObject(o);
                        const dopHelper = new DOPHelper(
                            dop,
                            new THREE.Color(0xff00ff)
                        );
                        const folder = this.gui.addFolder(
                            "group " + Math.random().toString(36).slice(2, 5)
                        );
                        folder.add(dopHelper, "visible").name("mesh visible");
                        folder.add(dopHelper, "visible").name("helper visible");
                        this.add(dopHelper);
                    }
                });

                console.log(this);
                this.add(gltf.scene);

                gltf.animations; // Array<THREE.AnimationClip>
                gltf.scene; // THREE.Group
                gltf.scenes; // Array<THREE.Group>
                gltf.cameras; // Array<THREE.Camera>
                gltf.asset; // Object
            },
            // called while loading is progressing
            function (xhr) {
                console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
            },
            // called when loading has errors
            function (error) {
                throw error;
            }
        );

        this.initializeLights();

        callback();
    }

    initializeGUI() {
        this.gui
            .add(
                {
                    add: () => {
                        this.traverse(function (o) {
                            if (o instanceof THREE.Mesh) {
                                o.visible = false;
                            }
                        });
                    },
                },
                "add"
            )
            .name("hide all meshes");
        this.gui
            .add(
                {
                    add: () => {
                        this.traverse(function (o) {
                            if (o instanceof THREE.Mesh) {
                                o.visible = true;
                            }
                        });
                    },
                },
                "add"
            )
            .name("show all meshes");
        this.gui
            .add(
                {
                    add: () => {
                        for (const dh of this.DOPHelpers) {
                            dh.visible = false;
                        }
                    },
                },
                "add"
            )
            .name("hide all k-DOP helpers");
        this.gui
            .add(
                {
                    add: () => {
                        for (const dh of this.DOPHelpers) {
                            dh.visible = true;
                        }
                    },
                },
                "add"
            )
            .name("show all k-DOP helpers");
    }

    initializeLights() {
        {
            const light = new THREE.AmbientLight(0xeeeeee); // soft white light
            // const light = new THREE.AmbientLight(0x888888); // soft white light
            // const light = new THREE.AmbientLight(0x444444); // soft white light
            this.add(light);
        }

        {
            const light = new THREE.PointLight(0xffaa44, 20);
            light.position.set(5, 2, 0);
            this.add(light);
        }

        {
            const light = new THREE.PointLight(0xffaa44, 20);
            light.position.set(-5, 2, 0);
            this.add(light);
        }

        // {
        //     const light = new THREE.DirectionalLight(0xffffee, 1);
        //     light.position.set(0, 4, 2);
        //     this.add(light);
        // }

        // {
        //     const light = new THREE.DirectionalLight(0x0000ff, 0.1);
        //     light.position.set(0, -4, -2);
        //     this.add(light);
        // }
    }

    update() {}

    getVertices(): THREE.Float32BufferAttribute[] {
        const buffers: THREE.Float32BufferAttribute[] = [];
        this.traverse(function (o) {
            if (o instanceof THREE.Mesh) {
                buffers.push(o.geometry.getAttribute("position"));
            }
        });

        return buffers;
    }
}
