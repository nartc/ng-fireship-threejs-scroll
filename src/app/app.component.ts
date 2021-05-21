import {
  CanvasStore,
  DestroyedService,
  LoaderService,
  ThreeVector3,
} from "@angular-three/core";
import { DOCUMENT } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnInit,
} from "@angular/core";
import { forkJoin, fromEvent } from "rxjs";
import {
  map,
  startWith,
  switchMap,
  take,
  takeUntil,
  tap,
  withLatestFrom,
} from "rxjs/operators";
import * as THREE from "three";

@Component({
  selector: "app-root",
  template: `
    <div class="canvasContainer">
      <ngt-canvas [linear]="true" [camera]="{ position: [-3, 0, 30] }">
        <app-scene></app-scene>
      </ngt-canvas>
    </div>
    <app-portfolio></app-portfolio>
  `,
})
export class AppComponent {}

@Component({
  selector: "app-scene",
  template: `
    <!--    torus-->
    <ngt-mesh (animateReady)="onTorusAnimateReady($event.animateObject)">
      <ngt-torus-geometry [args]="[10, 3, 16, 100]"></ngt-torus-geometry>
      <ngt-mesh-standard-material
        [parameters]="{ color: '#ff6347' }"
      ></ngt-mesh-standard-material>
    </ngt-mesh>

    <!--    lights-->
    <ngt-point-light color="#ffffff" [position]="[5, 5, 5]"></ngt-point-light>
    <ngt-ambient-light color="#ffffff"></ngt-ambient-light>

    <!--    stars-->
    <ngt-sphere-geometry
      ngtId="star"
      [args]="[0.25, 24, 24]"
    ></ngt-sphere-geometry>
    <ngt-mesh-standard-material
      ngtId="starMaterial"
      [parameters]="{ color: '#ffffff' }"
    ></ngt-mesh-standard-material>
    <ngt-mesh
      *ngFor="let starPosition of starPositions"
      [position]="starPosition"
      geometry="star"
      material="starMaterial"
    ></ngt-mesh>

    <!--    avatar-->
    <ng-container *ngIf="avatarTexture$ | async as avatarTexture">
      <ngt-mesh [position]="[2, 0, -5]" (ready)="chau = $event">
        <ngt-box-geometry [args]="[3, 3, 3]"></ngt-box-geometry>
        <ngt-mesh-basic-material
          [parameters]="{ map: avatarTexture }"
        ></ngt-mesh-basic-material>
      </ngt-mesh>
    </ng-container>

    <!--    moon-->
    <ng-container *ngIf="moonTextures$ | async as moonTextures">
      <ngt-mesh
        [position]="[-10, 0, 30]"
        (animateReady)="onMoonAnimateReady($event.animateObject)"
        (ready)="moon = $event"
      >
        <ngt-sphere-geometry [args]="[3, 32, 32]"></ngt-sphere-geometry>
        <ngt-mesh-standard-material
          [parameters]="{
            map: moonTextures.moon,
            normalMap: moonTextures.normal
          }"
        ></ngt-mesh-standard-material>
      </ngt-mesh>
    </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DestroyedService],
})
export class SceneComponent implements OnInit {
  starPositions: ThreeVector3[] = Array.from({ length: 200 })
    .fill(undefined)
    .map(() => [
      THREE.MathUtils.randFloatSpread(100),
      THREE.MathUtils.randFloatSpread(100),
      THREE.MathUtils.randFloatSpread(100),
    ]);

  avatarTexture$ = this.loaderService.use(
    THREE.TextureLoader,
    "/assets/chau.jpeg"
  );

  moonTextures$ = forkJoin([
    this.loaderService.use(THREE.TextureLoader, "/assets/moon.jpeg"),
    this.loaderService.use(THREE.TextureLoader, "/assets/normal.jpeg"),
  ]).pipe(map(([moon, normal]) => ({ moon, normal })));

  moon?: THREE.Mesh;
  chau?: THREE.Mesh;

  constructor(
    @Inject(DOCUMENT) private readonly doc: Document,
    private readonly loaderService: LoaderService,
    private readonly canvasStore: CanvasStore,
    private readonly destroyed: DestroyedService
  ) {}

  ngOnInit() {
    this.canvasStore.scene$
      .pipe(
        take(1),
        switchMap((scene) =>
          this.loaderService
            .use(THREE.TextureLoader, "/assets/space.jpeg")
            .pipe(
              take(1),
              tap((space) => {
                if (scene) {
                  scene.background = space;
                }
              })
            )
        )
      )
      .subscribe();

    fromEvent(this.doc, "scroll")
      .pipe(
        map(() => this.doc.body.getBoundingClientRect().top),
        startWith(0),
        withLatestFrom(this.canvasStore.camera$),
        takeUntil(this.destroyed)
      )
      .subscribe(([top, camera]) => {
        if (this.moon) {
          this.moon.rotation.x += 0.05;
          this.moon.rotation.y += 0.075;
          this.moon.rotation.z += 0.05;
        }

        if (this.chau) {
          this.chau.rotation.y += 0.01;
          this.chau.rotation.z += 0.01;
        }

        if (camera) {
          camera.position.z = top * -0.01;
          camera.position.x = top * -0.0002;
          camera.rotation.y = top * -0.0002;
        }
      });
  }

  onTorusAnimateReady(torus: THREE.Mesh) {
    torus.rotation.x += 0.01;
    torus.rotation.y += 0.005;
    torus.rotation.z += 0.01;
  }

  onMoonAnimateReady(moon: THREE.Mesh) {
    moon.rotation.x += 0.005;
  }
}
