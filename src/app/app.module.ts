import { ThreeCoreModule } from "@angular-three/core";
import {
  ThreeBoxBufferGeometryModule,
  ThreeSphereBufferGeometryModule,
  ThreeTorusBufferGeometryModule,
} from "@angular-three/core/geometries";
import {
  ThreeAmbientLightModule,
  ThreePointLightModule,
} from "@angular-three/core/lights";
import {
  ThreeMeshBasicMaterialModule,
  ThreeMeshStandardMaterialModule,
} from "@angular-three/core/materials";
import { ThreeMeshModule } from "@angular-three/core/meshes";
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppComponent, SceneComponent } from "./app.component";
import { PortfolioComponent } from "./portfolio.component";

@NgModule({
  declarations: [AppComponent, PortfolioComponent, SceneComponent],
  imports: [
    BrowserModule,
    ThreeCoreModule,
    ThreeMeshModule,
    ThreeTorusBufferGeometryModule,
    ThreeSphereBufferGeometryModule,
    ThreeBoxBufferGeometryModule,
    ThreeMeshBasicMaterialModule,
    ThreeMeshStandardMaterialModule,
    ThreePointLightModule,
    ThreeAmbientLightModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
