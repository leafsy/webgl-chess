"use strict";
var PerspectiveCamera = function() 
{ 
  this.position = new Vec3(-20.0, 5.0, 0.0); 
  this.origin = new Vec3(0.0, 0.0, 0.0);
  this.ahead = new Vec3(1.0, 0.0, 0.0); 
  this.right = new Vec3(0.0, 0.0, 1.0); 
  this.up = new Vec3(0.0, 1.0, 0.0);  
  
  this.yaw = -Math.PI/2; 
  this.pitch = Math.atan(this.position.y/this.position.x); 
  this.fov = 1.0; 
  this.aspect = 1.0; 
  this.nearPlane = 0.1; 
  this.farPlane = 1000.0; 

  this.zoomSpeed = 5; 
  this.rotSpeed = 1;
  this.maxZoom = 25;
  this.minZoom = 15;
  this.maxPitch = -0.2;
  this.minPitch = -1.2;

  this.viewMatrix = new Mat4(); 
  this.projMatrix = new Mat4();
  this.viewProjMatrix = new Mat4();
  this.rayDirMatrix = new Mat4();
  this.updateViewMatrix();
  this.updateProjMatrix(); 
}; 

PerspectiveCamera.WORLD_UP = new Vec3(0, 1, 0);

PerspectiveCamera.prototype.updateViewMatrix = function(){ 
  this.viewMatrix.set( 
    this.right.x          ,  this.right.y      ,  this.right.z       , 0, 
    this.up.x             ,  this.up.y         ,  this.up.z          , 0, 
   -this.ahead.x          , -this.ahead.y      ,  -this.ahead.z      , 0, 
    0  , 0  , 0   , 1).translate(this.position).invert();
  
  this.viewProjMatrix.set(this.viewMatrix).mul(this.projMatrix);
  this.rayDirMatrix.set().translate(this.position)
    .mul(this.viewMatrix).mul(this.projMatrix).invert();
   
}; 

PerspectiveCamera.prototype.updateProjMatrix = function(){ 
  var yScale = 1.0 / Math.tan(this.fov * 0.5); 
  var xScale = yScale / this.aspect; 
  var f = this.farPlane; 
  var n = this.nearPlane; 
  this.projMatrix.set( 
      xScale ,    0    ,      0       ,   0, 
        0    ,  yScale ,      0       ,   0, 
        0    ,    0    ,  (n+f)/(n-f) ,  -1, 
        0    ,    0    ,  2*n*f/(n-f) ,   0); 
  this.viewProjMatrix.set(this.viewMatrix).
                      mul(this.projMatrix); 
}; 

PerspectiveCamera.prototype.move = function(dt, keysPressed) { 
  let disp = this.position.minus(this.origin);

  if (keysPressed.Q && disp.length() > this.minZoom) {
    this.position.addScaled(-this.zoomSpeed * dt, disp.normalize()); 
  }
  else if (keysPressed.E && disp.length() < this.maxZoom) {
    this.position.addScaled(this.zoomSpeed * dt, disp.normalize()); 
  }
  else if (keysPressed.S && this.pitch < this.maxPitch) {
    this.pitch += this.rotSpeed * dt;
    this.position.y = Math.sin(-this.pitch) * disp.length();
    var r = Math.cos(-this.pitch) * disp.length();
    this.position.x = r * Math.sin(this.yaw);
    this.position.z = r * Math.cos(this.yaw);
  }
  else if (keysPressed.W && this.pitch > this.minPitch) {
    this.pitch -= this.rotSpeed * dt;
    this.position.y = Math.sin(-this.pitch) * disp.length();
    var r = Math.cos(-this.pitch) * disp.length();
    this.position.x = r * Math.sin(this.yaw);
    this.position.z = r * Math.cos(this.yaw);
  } else {
    disp.y = 0;

    if (keysPressed.D) {
      this.yaw += this.rotSpeed * dt;
      this.position.x = Math.sin(this.yaw) * disp.length();
      this.position.z = Math.cos(this.yaw) * disp.length();
    }
    else if (keysPressed.A) {
      this.yaw -= this.rotSpeed * dt;
      this.position.x = Math.sin(this.yaw) * disp.length();
      this.position.z = Math.cos(this.yaw) * disp.length();
    }
  }

  this.ahead = new Vec3(
     -Math.sin(this.yaw)*Math.cos(this.pitch),
      Math.sin(this.pitch),
     -Math.cos(this.yaw)*Math.cos(this.pitch) ); 
    this.right.setVectorProduct(
      this.ahead,
      PerspectiveCamera.WORLD_UP ); 
    this.right.normalize(); 
    this.up.setVectorProduct(this.right, this.ahead); 

  this.updateViewMatrix(); 
}; 

// ar: canvas.clientWidth / canvas.clientHeight
PerspectiveCamera.prototype.setAspectRatio = function(ar) 
{ 
  this.aspect = ar; 
  this.updateProjMatrix(); 
};



