"use strict";
let ChessGame = function() {

	this.board = [[],[],[],[],[],[],[],[]];
	this.turn = 1;
	this.over = false;

	this.chessPieces = [
	    new ChessPiece(ChessPiece.types.ROOK,   0),
	    new ChessPiece(ChessPiece.types.KNIGHT, 0),
	    new ChessPiece(ChessPiece.types.BISHOP, 0),
	    new ChessPiece(ChessPiece.types.QUEEN,  0),
	    new ChessPiece(ChessPiece.types.KING,   0),
	    new ChessPiece(ChessPiece.types.BISHOP, 0),
	    new ChessPiece(ChessPiece.types.KNIGHT, 0),
	    new ChessPiece(ChessPiece.types.ROOK,   0),
	    new ChessPiece(ChessPiece.types.PAWN,   0),
	    new ChessPiece(ChessPiece.types.PAWN,   0),
	    new ChessPiece(ChessPiece.types.PAWN,   0),
	    new ChessPiece(ChessPiece.types.PAWN,   0),
	    new ChessPiece(ChessPiece.types.PAWN,   0),
	    new ChessPiece(ChessPiece.types.PAWN,   0),
	    new ChessPiece(ChessPiece.types.PAWN,   0),
	    new ChessPiece(ChessPiece.types.PAWN,   0),
	    new ChessPiece(ChessPiece.types.PAWN,   1),
	    new ChessPiece(ChessPiece.types.PAWN,   1),
	    new ChessPiece(ChessPiece.types.PAWN,   1),
	    new ChessPiece(ChessPiece.types.PAWN,   1),
	    new ChessPiece(ChessPiece.types.PAWN,   1),
	    new ChessPiece(ChessPiece.types.PAWN,   1),
	    new ChessPiece(ChessPiece.types.PAWN,   1),
	    new ChessPiece(ChessPiece.types.PAWN,   1),
	    new ChessPiece(ChessPiece.types.ROOK,   1),
	    new ChessPiece(ChessPiece.types.KNIGHT, 1),
	    new ChessPiece(ChessPiece.types.BISHOP, 1),
	    new ChessPiece(ChessPiece.types.QUEEN,  1),
	    new ChessPiece(ChessPiece.types.KING,   1),
	    new ChessPiece(ChessPiece.types.BISHOP, 1),
	    new ChessPiece(ChessPiece.types.KNIGHT, 1),
	    new ChessPiece(ChessPiece.types.ROOK,   1)
  	];

  	for (var i = 0; i < this.chessPieces.length; i++) {
  		var col = i % 8;
  		var row = Math.floor(i / 8);
  		if (row > 1) { row += 4; }
  		this.board[row][col] = this.chessPieces[i];
		this.chessPieces[i].setPosition(row, col);
  	}

  	this.origin = null;
  	this.target = null;
}

ChessGame.prototype.getChessPiece = function(position) {
	if (!position) { return null; }
	return this.board[position[1]][position[0]];
}

ChessGame.prototype.moveChessPiece = function(chessPiece) {
	if (!this.target || !this.origin) { return; }
	if (this.origin) { this.board[this.origin[1]][this.origin[0]] = null; }
	this.board[this.target[1]][this.target[0]] = chessPiece;
	chessPiece.setPosition(this.target[1], this.target[0]);
	chessPiece.moveProgress = 1;
	this.target = null;
	this.origin = null;
};

ChessGame.prototype.posToStr = function(position) {
	return "ABCDEFGH".charAt(position[0]) + (8 - position[1]);
};

ChessGame.prototype.listenForGameOver = function() {
	for (var i = 0; i < this.chessPieces.length; i++) {
		if (this.chessPieces[i].type == ChessPiece.types.KING &&
			!this.chessPieces[i].live) {
			this.over = true;
			showMsg("Game over! " + (this.chessPieces[i].side? 
				"RED":"BLUE") + " has won.", true);
			for (var j = 0; j < this.chessPieces.length; j++) {
				if (this.chessPieces[j].live &&
					this.chessPieces[i].side == this.chessPieces[j].side) {
					this.chessPieces[j].fallProgress = 1;
				}
			}
			return;
		}
	}
};

ChessGame.prototype.isLegalMove = function(origin, target) {
	var origin = origin || this.origin;
	var target = target || this.target;
	var originPiece = this.getChessPiece(origin);
	var targetPiece = this.getChessPiece(target);
	if (!originPiece || originPiece.side != this.turn) return false;
	if (targetPiece && targetPiece.side == this.turn) return false;

	switch (originPiece.type) {
		case ChessPiece.types.KING:
			return this.isLegalKingMove(origin, target);
		case ChessPiece.types.QUEEN:
			return this.isLegalRookMove(origin, target) ||
					this.isLegalBishopMove(origin, target);
		case ChessPiece.types.ROOK:
			return this.isLegalRookMove(origin, target);
		case ChessPiece.types.BISHOP:
			return this.isLegalBishopMove(origin, target);
		case ChessPiece.types.KNIGHT:
			return this.isLegalKnightMove(origin, target);
		case ChessPiece.types.PAWN:
			return this.isLegalPawnMove(origin, target);
	}
};

ChessGame.prototype.isLegalKingMove = function(o, t) {
	var offsetX = t[0] - o[0];
	var offsetZ = t[1] - o[1];
	return Math.abs(offsetX) <= 1 && Math.abs(offsetZ) <= 1;
}

ChessGame.prototype.isLegalRookMove = function(o, t) {
	var offsetX = t[0] - o[0];
	var offsetZ = t[1] - o[1];
	if (offsetX != 0 && offsetZ != 0) return false;

	for (var i = 1; i < Math.abs(offsetX || offsetZ); i++) {
		if (this.getChessPiece(
			[o[0] + i*Math.sign(offsetX), o[1] + i*Math.sign(offsetZ)])) {
			return false;
		}
	}
	return true;
}

ChessGame.prototype.isLegalBishopMove = function(o, t) {
	var offsetX = t[0] - o[0];
	var offsetZ = t[1] - o[1];
	if (Math.abs(offsetX) != Math.abs(offsetZ)) return false;

	for (var i = 1; i < Math.abs(offsetX); i++) {
		if (this.getChessPiece(
			[o[0] + i*Math.sign(offsetX), o[1] + i*Math.sign(offsetZ)])) {
			return false;
		}
	}
	return true;
}

ChessGame.prototype.isLegalKnightMove = function(o, t) {
	var offsetX = Math.abs(t[0] - o[0]);
	var offsetZ = Math.abs(t[1] - o[1]);
	if (offsetX > 2 || offsetZ > 2) return false;
	return offsetX + offsetZ == 3;
}

ChessGame.prototype.isLegalPawnMove = function(o, t) {
	var offsetX = Math.abs(t[0] - o[0]);
	var offsetZ = t[1] - o[1];
	var originPiece = this.getChessPiece(o);
	if (originPiece.side) offsetZ = -offsetZ;
	if (offsetZ < 1 || offsetX > 1) return false;
	if (offsetZ > (originPiece.moved? 1 : 2)) return false;
	if (offsetX == 0 && this.getChessPiece(t)) return false;
	if (offsetX > 0 && !this.getChessPiece(t)) return false;
	return true;
}