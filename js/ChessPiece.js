"use strict";
let ChessPiece = function(type, side) {
	this.type = type;
	this.side = side;
	this.live = true;
	this.moved = false;

	this.position = new Vec3(0, 0, 0);
	this.oldPos = new Vec3(0, 0, 0);
	this.newPos = new Vec3(0, 0, 0);

	this.moveProgress = 0;
	this.fallProgress = 0;

	this.quadrics = [];
	this.brdf = new Vec4(0, 0.2, 10);
	if (this.side) { this.brdf.x = 1; }

	switch (type) {
		case ChessPiece.types.KING:
			this.drawKing();
			break;
		case ChessPiece.types.QUEEN:
			this.drawQueen();
			break;
		case ChessPiece.types.ROOK:
			this.drawRook();
			break;
		case ChessPiece.types.BISHOP:
			this.drawBishop();
			break;
		case ChessPiece.types.KNIGHT:
			this.drawKnight();
			break;
		case ChessPiece.types.PAWN:
			this.drawPawn();
			break;
	}
}

ChessPiece.types = Object.freeze({
	"KING": "KING",
	"QUEEN": "QUEEN",
	"ROOK": "ROOK",
	"BISHOP": "BISHOP",
	"KNIGHT": "KNIGHT",
	"PAWN": "PAWN"
});

ChessPiece.CELL_WIDTH = 2;

ChessPiece.prototype.setPosition = function(row, col) {
	this.oldPos = this.position.clone();
	this.newPos = new Vec3(
		(col - 3.5) * ChessPiece.CELL_WIDTH, 0,
		(row - 3.5) * ChessPiece.CELL_WIDTH);
	this.position = this.newPos.clone();
}

ChessPiece.SELT_ALTITUDE = 0.5;
ChessPiece.MOVE_DURATION = 10;
ChessPiece.MOVE_ALTITUDE = 4;
ChessPiece.FALL_DURATION = 2;
ChessPiece.FALL_ALTITUDE = 2.5;

ChessPiece.prototype.updateMoveProgress = function() {
	if (this.moveProgress <= 0) return; 
	let t = this.moveProgress;
	let duration = ChessPiece.MOVE_DURATION;
	if (t > duration) {
		this.position = this.newPos;
		this.moveProgress = 0;
		this.moved = true;
		showMsg((this.side? "RED":"BLUE") + "'s turn", true);
		showMsg("");
		return;
	}

	let offsetX = (this.newPos.x-this.oldPos.x) * (t / duration);
	let offsetZ = (this.newPos.z-this.oldPos.z) * (t / duration);
	let a = -4 * ChessPiece.MOVE_ALTITUDE / (duration * duration);
	let b = -a * duration;
	let offsetY = a * t*t + b * t;
	this.position.set(this.oldPos).add(offsetX, offsetY, offsetZ);
	this.moveProgress++;
}

ChessPiece.prototype.updateFallProgress = function() {
	if (this.fallProgress <= 0) return;
	let t = this.fallProgress;
	if (t > ChessPiece.MOVE_DURATION) {
		this.fallProgress = 0;
		this.live = false;
		return;
	}
	let duration = ChessPiece.FALL_DURATION;
	if (t > ChessPiece.MOVE_DURATION - duration) {
		this.position.y -= ChessPiece.FALL_ALTITUDE / duration;
	}
	this.fallProgress++;
}

ChessPiece.prototype.getTranslatedQuadrics = function() {
	var quadrics = [];
	for (var i = 0; i < this.quadrics.length; i++) {
		var quadric = this.quadrics[i].clone();
		quadric.transform((new Mat4()).translate(this.position));
		quadrics.push(quadric);
	}
	return quadrics;
}

ChessPiece.prototype.drawKing = function() {
	let body = new ClippedQuadric().setUnitHyperboloid(1);
	body.transform(
		new Mat4().scale(new Vec3(0.1, 1.3, 0.1)).translate(0, 1.3, 0));
	body.transformSurface(
		new Mat4().scale(new Vec3(1, 0.4, 1)).translate(0, 1.8, 0));
	this.quadrics.push(body);

	let head = new ClippedQuadric().setUnitParaboloid();
	head.transform(
		new Mat4().scale(0.4).translate(0, 1.7, 0));
	this.quadrics.push(head);

	let deco = new ClippedQuadric().setUnitCylinder();
	deco.transform(
		new Mat4().scale(new Vec3(0.1, 0.3, 0.1)).rotate(Math.PI/2, 0, 0, 1).
				translate(0, 2.35, 0));
	this.quadrics.push(deco);
}

ChessPiece.prototype.drawQueen = function() {
	let body = new ClippedQuadric().setUnitHyperboloid(4);
	body.transform(
		new Mat4().scale(new Vec3(0.1, 0.7, 0.1)).translate(0, 0.7, 0));
	body.transformSurface(
		new Mat4().scale(new Vec3(1, 0.3, 1)).translate(0, 0.7, 0));
	this.quadrics.push(body);

	let head = new ClippedQuadric().setUnitParaboloid();
	head.clipperCoeffMatrix.set(
	    1, 0, 0, 0,
		0, 0, 0, 0,
		0, 0, 1, 0,
		0, 1, 0, 0);
	head.transformClipper(
		new Mat4().scale(new Vec3(1, 0.4, 1)).translate(0, 1.5, 0));
	head.transform(
		new Mat4().scale(0.4).translate(0, 1.7, 0));
	this.quadrics.push(head);

	let deco = new ClippedQuadric().setUnitSphere();
	deco.transform(
		new Mat4().scale(0.16).translate(0, 2.4, 0));
	this.quadrics.push(deco);
}

ChessPiece.prototype.drawRook = function() {
	let base = new ClippedQuadric().setUnitCone();
	base.transform(
		new Mat4().scale(new Vec3(0.45, 0.8, 0.45)).translate(0, 0.8, 0));
	base.transformSurface(new Mat4().scale(new Vec3(1, 4, 1)));
	this.quadrics.push(base);

	let roof = new ClippedQuadric().setUnitSphere();
	roof.clipperCoeffMatrix.set(
	   -1, 0, 0, 0,
		0, 0, 0, 0,
		0, 0,-1, 0,
		0, 1, 0, 0);
	roof.transformClipper(
		new Mat4().scale(new Vec3(1, 2, 1)).translate(0, -1, 0));
	roof.transform(
		new Mat4().scale(0.5).translate(0, 1.7, 0));
	this.quadrics.push(roof);
}

ChessPiece.prototype.drawBishop = function() {
	let cone = new ClippedQuadric().setUnitCone();
	cone.transform(
		new Mat4().scale(new Vec3(0.5, 1, 0.5)).translate(0, 1, 0));
	this.quadrics.push(cone);

	let head = new ClippedQuadric().setUnitSphere();
	head.clipperCoeffMatrix.set(
	   -1, 0, 0, 0,
		0,-1, 0, 0,
		0, 0, 0, 0,
		0, 0, 0, 1);
	head.transformClipper(
		new Mat4().scale(new Vec3(0.2, 0.55, 1)).translate(0, 0.6, 0));
	head.transform(
		new Mat4().scale(new Vec3(0.4, 0.6, 0.4)).translate(0, 1.9, 0));
	this.quadrics.push(head);
}

ChessPiece.prototype.drawKnight = function() {
	let neck = new ClippedQuadric().setUnitCone();
	neck.transformSurface(new Mat4().rotate(0.34, 0, 0, 1).scale(1.1));
	neck.transform(
		new Mat4().scale(new Vec3(0.5, 0.85, 0.5)).translate(-0.2, 0.9, 0));
	this.quadrics.push(neck);

	let head = new ClippedQuadric().setUnitCone();
	head.clipperCoeffMatrix.set(
	    1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0,-1);
	head.transformClipper(
		new Mat4().scale(new Vec3(0.7, 0.7, 0.25)).translate(0.3, 1.6, 0));
	head.transformSurface(
		new Mat4().scale(new Vec3(1, 1, 0.6)).rotate(0.8, 0, 0, 1)
					.translate(1.5, 0.2, 0));
	this.quadrics.push(head);
}

ChessPiece.prototype.drawPawn = function() {
	let cone = new ClippedQuadric().setUnitCone();
	cone.transform(
		new Mat4().scale(new Vec3(0.5, 0.8, 0.5)).translate(0, 0.8, 0));
	this.quadrics.push(cone);

	let sphere = new ClippedQuadric().setUnitSphere();
	sphere.transform(
		new Mat4().scale(0.45).translate(0, 1.6, 0));
	this.quadrics.push(sphere);
};