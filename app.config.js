import 'dotenv/config'

export default {
  "expo": {
    "name": "chat-app",
    "slug": "chat-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/whatsapp-logo.png",
    "userInterfaceStyle": "light",
    "newArchEnabled": true,
    "splash": {
      "image": "./assets/whatsapp.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.reitansora.chatapp"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/whatsapp-logo.png",
        "backgroundColor": "#ffffff"
      },
      "permissions": [
        "android.permission.RECORD_AUDIO"
      ],
      "package": "com.reitansora.chatapp"
    },
    "web": {
      "favicon": "./assets/whatsapp.png"
    },
    "plugins": [
      [
        "expo-image-picker",
        {
          "photosPermission": "The app accesses your photos to let you share them with your friends."
        }
      ]
    ],
    "extra": {
      "eas": {
        "projectId": "71e11258-1522-42aa-bcbf-a54b82727e5c"
      },
      "apiKey": process.env.API_KEY,
      "authDomain": process.env.AUTH_DOMAIN,
      "projectId": process.env.PROJECT_ID,
      "storageBucket": process.env.STORAGE_BUCKET,
      "messagingSenderId": process.env.MESSAGING_SENDER_ID,
      "appId": process.env.APP_ID,
      "measurementId": process.env.MEASUREMENT_ID,
      "algolia_app_id": process.env.ALGOLIA_APP_ID,
      "algolia_api_id": process.env.ALGOLIA_API_ID,
      "algolia_index": process.env.ALGOLIA_INDEX,
    }
  }
}
