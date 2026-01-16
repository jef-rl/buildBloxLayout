{ pkgs, ... }: {
  packages = [ pkgs.nodejs_20 pkgs.npm ];
  env = {
    VITE_FIREBASE_API_KEY = "AIzaSyAAGokzPy3GoeebzwbykpXUqmQVZgf0DAI";
    VITE_FIREBASE_AUTH_DOMAIN = "lozzuck.firebaseapp.com";
    VITE_FIREBASE_PROJECT_ID = "lozzuck";
    VITE_FIREBASE_STORAGE_BUCKET = "lozzuck.appspot.com";
    VITE_FIREBASE_MESSAGING_SENDER_ID = "1059829133797";
    VITE_FIREBASE_APP_ID = "1:1059829133797:web:35d339c1c1399c12efff0c";
  };
  idx = {
    extensions = [ "dbaeumer.vscode-eslint"  "google.gemini-cli-vscode-ide-companion"];
    workspace = {
      onCreate = {
        npm-install = "npm install";
      };
      onStart = {
        dev-server = "npm run dev";
      };
    };
    previews = {
      enable = true;
      previews = {
        web = {
          command = ["npm" "run" "dev" "--" "--port" "$PORT"];
          manager = "web";
        };
      };
    };
  };
}
