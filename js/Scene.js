"use strict";
let Scene = function(gl) {
  gl.enable(gl.BLEND);
  gl.enable(gl.DEPTH_TEST);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  this.vsQuad = new Shader(gl, gl.VERTEX_SHADER, "quad_vs.essl");
  this.fsQuad = new Shader(gl, gl.FRAGMENT_SHADER, "quad_fs.essl");
  this.quadProgram = new Program(gl, this.vsQuad, this.fsQuad);

  this.material = new Material(gl, this.quadProgram);
  this.material.colorTexture.set(
    (new Texture2D(gl, 'assets/bkgrd.jpg')).glTexture);
  
  this.camera = new PerspectiveCamera();

  this.quadPanel = new Panel(
    new Mesh(new TexturedQuadGeometry(gl), this.material));

  this.timeAtLastFrame = new Date().getTime();
};

Scene.prototype.update = function(gl, keysPressed) {
  let timeAtThisFrame = new Date().getTime();
  let dt = (timeAtThisFrame - this.timeAtLastFrame) / 1000.0;
  this.timeAtLastFrame = timeAtThisFrame;

  this.camera.move(dt, keysPressed);

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clearDepth(1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  this.quadProgram.commit();
  this.quadPanel.draw(this.camera);
};


