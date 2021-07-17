import FirebaseApp from 'firebase'

import { initFireBase } from '../configs/firebase-confug'

export default class Firebase {

    app: FirebaseApp.app.App
    database: FirebaseApp.database.Database

    constructor() {
        this.app = FirebaseApp.initializeApp(initFireBase)
        this.database = FirebaseApp.database(this.app)
    }
}