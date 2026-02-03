# To learn more about how to use Nix to configure your environment
# see: https://developers.google.com/idx/guides/customize-idx-env
{ pkgs, ... }: {
  # Which nixpkgs channel to use.
  channel = "stable-24.05"; # or "unstable"
  # Use https://search.nixos.org/packages to find packages
  packages = [
    pkgs.nodejs_20
    pkgs.yarn

  ];
  # Sets environment variables in the workspace
  env = {
    VITE_FIREBASE_API_KEY = "AIzaSyAAGokzPy3GoeebzwbykpXUqmQVZgf0DAI";
    VITE_FIREBASE_AUTH_DOMAIN = "lozzuck.firebaseapp.com";
    VITE_FIREBASE_PROJECT_ID = "lozzuck";
    VITE_FIREBASE_STORAGE_BUCKET = "lozzuck.appspot.com";
    VITE_FIREBASE_MESSAGING_SENDER_ID = "1059829133797";
    VITE_FIREBASE_APP_ID = "1:1059829133797:web:35d339c1c1399c12efff0c";
  };
  idx = {
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
    extensions = [
      # "vscodevim.vim"
    ];
    workspace = {
      # Runs when a workspace is first created with this `dev.nix` file
      # onCreate = {
      #   npm-install = "npm install";
      #   # Open editors for the following files by default, if they exist:
      #   default.openFiles = [ "index.html" "packages/app/src/main.ts" ];
      # };
      # To run something each time the workspace is (re)started, use the `onStart` hook
    };
    # Enable previews and customize configuration
    # previews = {
    #   enable = true;
    #   previews = {
    #     web = {
    #       command = [ "npm" "run" "dev:app" "--" "--port" "$PORT" "--host" "0.0.0.0" ];
    #       manager = "web";
    #     };
    #   };
    # };
  };
}
