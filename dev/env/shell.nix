let
  inherit (atom) pkgs;
in
  pkgs.mkShell {
    packages = with pkgs; [
      nodejs_23
    ];
  }
