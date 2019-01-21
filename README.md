# Capture the King

This is a chess-like WebGL game where the objective is to capture the opponent's king. All pieces move according to normal rules, but special moves such as castling and en passant captures are deactivated. The scene is rendered with ray tracing and environment mapping; gameplay is carried out exclusively through keyboard control.

## Controls

* A - rotate camera clockwise
* D - rotate camera counterclockwise
* W - rotate camera downward
* S - rotate camera upward
* Q - zoom in camera
* E - zoom out camera
* B - turn on/off shadows
* R - turn on/off reflections
* SPACE - turn on/off chess selector
* LEFT/RIGHT/UP/DOWN - select position
* ENTER - commit selection

## Instructions

Blue makes the first move. Press SPACE to enable selector, then the arrow keys to change highlighted square; press ENTER to select highlighted piece; use the arrow keys again to choose target position, then ENTER again to move the piece (if legal). Two players take turn making moves until one captures the other's king.

## Credits

Computer Graphics course taught by professor László Szécsi at [Aquincum Institute of Technology](https://www.ait-budapest.com/) in Budapest, Hungary.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
