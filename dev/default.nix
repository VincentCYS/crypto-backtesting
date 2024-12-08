let
  inherit (import ./npins) atom;
  importAtom = import "${atom}/src/core/importAtom.nix";
in {
  env = importAtom {} (./. + "/env@.toml");
}
