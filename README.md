# To-Do App

This project is a ToDo app, which allows users to create, edit and remove tasks using IonicStorage for internal data manipulation and a public API to simulate remote persistence 

Public API Docs and information:
- https://dummyjson.com/docs/posts#posts-all

Some notes:
- Adding a new post will not add it into the server. It will simulate a POST request and will return the new created post with a new id;
- Updating a post will not update it into the server.It will simulate a PUT/PATCH request and will return updated post with modified data;
- Deleting a post will not delete it into the server. It will simulate a DELETE request and will return deleted post with "isDeleted" and "deletedOn" keys.


## Project dependencies

- [Node.js](https://nodejs.org/) (Recommended version: 20 ou greater)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Ionic CLI](https://ionicframework.com/docs/cli) (`npm install -g @ionic/cli`)
- [Capacitor](https://capacitorjs.com/) (included on Ionic dependencies)
- [Android Studio](https://developer.android.com/studio) (generate APK)

Other dependencies are listed on `package.json` and will be installed after following the next instructions.

## Installation instructions

1. Clone repo:
    - git clone https://github.com/tgprudencio/to-do-app.git
2. Install project dependencies:
    - npm install
3. Run Ionic project on browser:
    - ionic serve
4. Run Ionic project on emulator or physical device (connected to computer):
    - ionic capacitor run android

## Generate APK

1. Make sure all dependencies are installed correctly
2. Build project:
    - ionic capacitor build android
3. Open project on Android Studio
    - ionic cap open android
4. On Android, go to:
    - Build -> Generate Signed App Bundle(s)/APK(s) -> APK.
5. Select a valid signature key or generate one by following official docs in:
    - "https://docs.oracle.com/cd/E29805_01/server.230/es_admin/src/tadm_ssl_jetty_keystore.html"
6. Fill up the form with the keystore credentials
7. Select Build Variant "Release" and press "Create"
8. The generated APK will be located in:
    - android/app/release/app-release.apk