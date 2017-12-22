"use strict"; 
let Panel = function(mesh) { 
  this.mesh = mesh;

  this.position = new Vec3(0, 0, 0); 
  this.orientation = 0; 
  this.scale = new Vec3(1, 1, 1);
  this.modelMatrix = new Mat4();

  this.hasShadow = false;
  this.hasReflect = true;

  this.game = new ChessGame();

  this.chessboard = new ClippedQuadric().setUnitCylinder().
    transform(new Mat4().
      scale(new Vec3(6*ChessPiece.CELL_WIDTH, 0.2, 6*ChessPiece.CELL_WIDTH)).
      translate(0, -0.1, 0));
};

Panel.prototype.updateModelMatrix = function() { 
	this.modelMatrix.set()
	.scale(this.scale)
	.rotate(this.orientation)
	.translate(this.position);
};

Panel.prototype.update = function(app) {
  let keysPressed = app.keysPressed;
  let camera = app.scene.camera;

  if (keysPressed.B) { this.hasShadow = !this.hasShadow; }
  if (keysPressed.R) { this.hasReflect = !this.hasReflect; }

  if (this.game.over) { return; }
  if (keysPressed.SPACE) {
    if (this.game.origin) {
      showMsg("");
      var originPiece = this.game.getChessPiece(this.game.origin);
      if (originPiece) { originPiece.position.y = 0 };
      this.game.origin = null;
      this.game.target = null;
    } else {
      this.game.origin = [4, this.game.turn? 7 : 0];
    }
  }
  if (keysPressed.ENTER) {
    var originPiece = this.game.getChessPiece(this.game.origin);
    if (originPiece) {
      if (this.game.target) {
        if (this.game.isLegalMove()) {
          var targetPiece = this.game.getChessPiece(this.game.target);
          showMsg((this.game.turn? "BLUE":"RED") + 
            " moves " + originPiece.type + " to " + 
            this.game.posToStr(this.game.target) + (targetPiece? 
            ", capturing opponent's " + targetPiece.type : ""));
          if (targetPiece) { targetPiece.fallProgress = 1; }
          this.game.moveChessPiece(originPiece);
          this.game.turn = 1 - this.game.turn;
        } else {
          showMsg("illegal move");
        }
      } else if (originPiece.side == this.game.turn) {
        showMsg((this.game.turn? "BLUE":"RED") + " selects " + 
          originPiece.type + " at " + this.game.posToStr(this.game.origin));
        originPiece.position.y = ChessPiece.SELT_ALTITUDE;
        this.game.target = this.game.origin.slice();
      }
    }
    return;
  }
  if (this.game.origin) {
    var pos = this.game.target? this.game.target : this.game.origin;
    let i = Math.abs(Math.cos(camera.yaw)) > 0.7? 0 : 1;
    let m = Math.sin(camera.yaw) > Math.cos(camera.yaw)? -1 : 1;
    let n = -Math.sin(camera.yaw) > Math.cos(camera.yaw)? -1 : 1;
    if (keysPressed.LEFT) {
      pos[i] = Math.max(0, Math.min(pos[i]-m, 7));
    } else if (keysPressed.RIGHT) {
      pos[i] = Math.max(0, Math.min(pos[i]+m, 7));
    } else if (keysPressed.UP) {
      pos[1-i] = Math.max(0, Math.min(pos[1-i]-n, 7));
    } else if (keysPressed.DOWN) {
      pos[1-i] = Math.max(0, Math.min(pos[1-i]+n, 7));
    }
    showMsg("currently selected square: " + this.game.posToStr(pos));
  }
};

Panel.prototype.draw = function(camera) { 
  this.updateModelMatrix();
  Material.viewPos.set(camera.position);
  Material.rayDirMatrix.set(camera.rayDirMatrix);

  Material.lightPos = new Vec4Array(10);
  Material.lightPowerDensity = new Vec4Array(10);
  Material.lightPos.at(0).set(1, 2, 4, 0);
  Material.lightPowerDensity.at(0).set(0.5, 0.5, 0.5, 0);

  Material.quadrics = new Mat4Array(140);
  Material.brdfs = new Vec3Array(70);
  Material.quadrics.at(0).set(this.chessboard.clipperCoeffMatrix);
  Material.quadrics.at(1).set(this.chessboard.surfaceCoeffMatrix);
  var pos = this.game.origin? 
            (this.game.origin[0]+1) + (this.game.origin[1]+1)/10 : 1;
  pos = this.game.target? 
            (this.game.target[0]+1) + (this.game.target[1]+1)/10 : pos;
  Material.brdfs.at(0).set(-pos, 0.1, 100);

  if (!this.game.over) { this.game.listenForGameOver(); }

  var i = 0; var j = 0;
  this.game.chessPieces.forEach(function(chessPiece) {
    if (!chessPiece.live) { return; }
    chessPiece.updateMoveProgress();
    chessPiece.updateFallProgress();
    var quadrics = chessPiece.getTranslatedQuadrics();
    quadrics.forEach(function(quadric) {
      i += 2;
      Material.quadrics.at(i).set(quadric.surfaceCoeffMatrix);
      Material.quadrics.at(i+1).set(quadric.clipperCoeffMatrix);
      Material.brdfs.at(i/2).set(chessPiece.brdf);
    });
    if (chessPiece.type == ChessPiece.types.KING) {
      j += 1;
      Material.lightPos.at(j).set(chessPiece.position.x, 
        chessPiece.position.y + 4, chessPiece.position.z, 1);
      if (chessPiece.side) {
        Material.lightPowerDensity.at(j).set(3.5, 3.5, 7, 0);
      } else {
        Material.lightPowerDensity.at(j).set(7, 3.5, 3.5, 0);
      }
    }
  });

  if (!this.hasReflect) {
    for (var n = 0; n <= i; n+=2) {
      Material.brdfs.at(n/2).y = 0;
    }
  }
  if (this.hasShadow) {
    for (var n = 0; n <= j; n++) {
      Material.lightPowerDensity.at(n).w = 1;
    }
  }

  this.mesh.draw();
};