/*
  This is an example of 2D rendering, simply
  using bitmap fonts in orthographic space.

  var geom = createText({
    multipage: true,
    ... other options
  })
 */

global.THREE = require("three");
var createOrbitViewer = require("three-orbit-viewer")(THREE);
var shuffle = require("array-shuffle");
var quotes = shuffle(
  require("sun-tzu-quotes/quotes.json").join(" ").split(".")
);
var createText = require("../");
var MSDFShader = require("../shaders/msdf");
var palettes = require("nice-color-palettes");
var palette = palettes[5];
var background = palette.shift();

require("./load")(
  {
    font: "fnt/Roboto-msdf.json",
    image: "fnt/Roboto-msdf.png",
  },
  start
);

function start(font, texture) {
  var app = createOrbitViewer({
    clearColor: 0xffffff,
    clearAlpha: 1.0,
    fov: 65,
    position: new THREE.Vector3(),
  });

  app.camera = new THREE.OrthographicCamera();
  app.camera.left = 0;
  app.camera.top = 0;
  app.camera.near = -1;
  app.camera.far = 1000;

  var container = new THREE.Object3D();
  app.scene.add(container);
  var count = 1;

  var angle = Math.PI * 2;
  var geom = createText({
    text: quotes[Math.floor(Math.random() * quotes.length)]
      .split(/\s+/g)
      .slice(0, 6)
      .join(" "),
    font: font,
    align: "left",
    flipY: texture.flipY,
  });

  var material = new THREE.RawShaderMaterial(
    MSDFShader({
      map: texture,
      transparent: true,
      color: 0x000000,
    })
  );

  var layout = geom.layout;
  var text = new THREE.Mesh(geom, material);
  text.position.set(-200, -layout.descender + layout.height, 0);
  text.scale.multiplyScalar(1);

  var textAnchor = new THREE.Object3D();
  textAnchor.add(text);
  textAnchor.rotation.z = angle;
  container.add(textAnchor);

  var time = 0;
  // update orthographic
  app.on("tick", function (dt) {
    time += dt / 5000;
    material.uniforms.iGlobalTime.value = time;
    material.uniforms.animate.value = Math.abs(Math.cos(time));
    console.log(material.uniforms.animate.value);
    //var s = (Math.sin(time * 0.5) * 0.5 + 0.5) * 2.0 + 0.5;
    container.scale.set(4, 4, 4);
    // update camera
    var width = app.engine.width;
    var height = app.engine.height;
    app.camera.left = -width / 2;
    app.camera.right = width / 2;
    app.camera.top = -height / 2;
    app.camera.bottom = height / 2;
    app.camera.updateProjectionMatrix();
  });

  function createGlyph() {}
}
