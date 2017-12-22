"use strict";
let ClippedQuadric = function(surfaceCoeffMatrix, clipperCoeffMatrix) {
  this.surfaceCoeffMatrix = surfaceCoeffMatrix || new Mat4();
  this.clipperCoeffMatrix = clipperCoeffMatrix || new Mat4();
}

ClippedQuadric.prototype.setUnitSphere = function(){
  this.surfaceCoeffMatrix.set(
  		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0,-1);
  this.clipperCoeffMatrix.set(
  		0, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 0, 0,
		0, 0, 0,-1);
  return this;
}

ClippedQuadric.prototype.setUnitCylinder = function(){
  this.surfaceCoeffMatrix.set(
  		1, 0, 0, 0,
		0, 0, 0, 0,
		0, 0, 1, 0,
		0, 0, 0,-1);
  this.clipperCoeffMatrix.set(
  		0, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 0, 0,
		0, 0, 0,-1);
  return this;
}

ClippedQuadric.prototype.setUnitCone = function(){
  this.surfaceCoeffMatrix.set(
  		1, 0, 0, 0,
		0,-1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 0);
  this.clipperCoeffMatrix.set(
  		0, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 0, 0,
		0, 0, 0,-1);
  this.transformSurface((new Mat4).
  	scale(new Vec3(0.5, 1, 0.5)).translate(0, 1, 0));
  return this;
}

ClippedQuadric.prototype.setUnitParaboloid = function(){
  this.surfaceCoeffMatrix.set(
  		1, 0, 0, 0,
		0, 0, 0, 0,
		0, 0, 1, 0,
		0,-1, 0, 0);
  this.clipperCoeffMatrix.set(
  		0, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 0, 0,
		0, 0, 0,-1);
  this.transformSurface((new Mat4).translate(0, -1, 0));
  return this;
}

ClippedQuadric.prototype.setUnitHyperboloid = function(a){
  this.surfaceCoeffMatrix.set(
  		1, 0, 0, 0,
		0,-1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0,-a);
  this.clipperCoeffMatrix.set(
  		0, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 0, 0,
		0, 0, 0,-1);
  return this;
}

ClippedQuadric.prototype.setUnitPlane = function(){
  this.surfaceCoeffMatrix.set(
  		0, 0, 0, 0,
		0, 0, 0, 1,
		0, 0, 0, 0,
		0, 0, 0, 0);
  this.clipperCoeffMatrix.set(
  		0, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 0, 0,
		0, 0, 0,-1);
  return this;
}

ClippedQuadric.prototype.transform = function(matT) {
	this.transformSurface(matT);
	this.transformClipper(matT);
	return this;
}

ClippedQuadric.prototype.transformSurface = function(matT) {
	let matTi = matT.clone().invert();
	this.surfaceCoeffMatrix.premul(matTi).mul(matTi.transpose());
	return this;
}

ClippedQuadric.prototype.transformClipper = function(matT) {
	let matTi = matT.clone().invert();
	this.clipperCoeffMatrix.premul(matTi).mul(matTi.transpose());
	return this;
}

ClippedQuadric.prototype.clone = function() {
	return new ClippedQuadric(
		this.surfaceCoeffMatrix.clone(), this.clipperCoeffMatrix.clone());
}

ClippedQuadric.matrices = {
	sphere: new Mat4(
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0,-1),
	cylinder: new Mat4(
		1, 0, 0, 0,
		0, 0, 0, 0,
		0, 0, 1, 0,
		0, 0, 0,-1),
	d_cone: new Mat4(
		1, 0, 0, 0,
		0,-1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 0),
	d_plane: new Mat4(
		0, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 0, 0,
		0, 0, 0,-1),
	paraboloid: new Mat4(
		1, 0, 0, 0,
		0, 0, 0, 0,
		0, 0, 1, 0,
		0, 0, 0,-1)
}