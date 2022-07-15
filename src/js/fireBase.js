define(['services/firebase',
        'services/firebase-app',
        'services/firebase-auth',
        'services/firebase-database',
        'services/firebase-firestore',
        'services/firebase-messaging',
        'services/firebase-analytics'
  ],
  function (firebase) {

    function inserirFirebase (idControladora, descricaoControladora, IP, quantidadeReles, quantidadeSensores, tipoControladora) {

        let db = firebase.firestore();
        let ag = db.collection("controladoras");
        
        return new Promise((resolve, reject) => {

            ag.add({
                idControladora: idControladora,
                descricaoControladora: descricaoControladora,
                IP: IP,
                quantidadeReles: quantidadeReles,
                quantidadeSensores: quantidadeSensores,
                tipoControladora: tipoControladora,
                created_at: firebase.firestore.FieldValue.serverTimestamp()
            })
            .then((docRef) => {
                resolve(docRef.id);
                console.log("Document written with ID: ", docRef.id);
            })
            .catch((error) => {
                reject(error);
                console.error("Error adding document: ", error);
            });
        });
    };

    function consultarFirebase () {

        let db = firebase.firestore();
        let ag = db.collection("controladoras");

        return new Promise((resolve, reject) => {
            
            ag.get()
            .then((querySnapshot) => {
                resolve(querySnapshot);
                querySnapshot.forEach((docRef) => {
                    console.log(docRef.id, " => ", docRef.data());
                });
            })
            .catch((error) => {
                reject(error);
                console.log("Error getting documents: ", error);
            });
        });
    };
          
    function consultarCodigoFirebase (codigoFireBase) {
        
        let db = firebase.firestore();
        let ag = db.collection("controladoras").doc(codigoFireBase);

        return new Promise((resolve, reject) => {
            
            ag.get()
            .then((querySnapshot) => {
                resolve(querySnapshot);
                querySnapshot.forEach((docRef) => {
                    console.log(docRef.id, " => ", docRef.data());
                });
            })
            .catch((error) => {
                reject(error);
                console.log("Error getting documents: ", error);
            });
        });
    };

    function atualizarFirebase (descricaoControladora, IP, quantidadeReles, quantidadeSensores, tipoControladora, codigoFireBase) {

        var db = firebase.firestore();
        var ag = db.collection("controladoras").doc(codigoFireBase);

        return new Promise(function(resolve, reject) {

            ag.update({
                descricaoControladora: descricaoControladora,
                IP: IP,
                quantidadeReles : quantidadeReles,
                quantidadeSensores : quantidadeSensores,
                tipoControladora : tipoControladora,
                codigoFireBase : codigoFireBase,
                created_at: firebase.firestore.FieldValue.serverTimestamp()
            })
            .then(() => {
                resolve(codigoFireBase)
                console.log("Document successfully updated!");
            })
            .catch((error) => {
                reject(error);
                console.error("Error updating document: ", error);
            });
        })
    };

    function excluirFirebase(codigoFireBase) {
        
        var db = firebase.firestore();
        var ag = db.collection("controladoras").doc(codigoFireBase);

        ag.get()
        .then(() => {
            ag.doc(codigoFireBase).delete().then(() => {
                console.log("Document successfully deleted!");
            }).catch((error) => {
                console.error("Error removing document: ", error);
            });
        })
        .catch((error) => {
            console.log("Error getting documents: ", error);
        });
    };

    
    async function sincronyzeDataBaseFireBase (DataBase) { 

        let result = await DataBase.queryController('SELECT * FROM CONTROLADORAS');
        let codigoFireBase;

        // registros criados no próprio APP 
           // - se ainda não sincronizou com o FireBase (não tem o codigo Firebase), cria no Firebase. 
           // - se já sincronizou com o Firebase (tem o codigo Firebase), atualiza os dados no Firebase.
        result.forEach( async (ctrl) => {
          ctrl.codigoFireBase ?
            codigoFireBase = await atualizarFirebase(ctrl.descricaoControladora, ctrl.IP, ctrl.quantidadeReles, ctrl.quantidadeSensores, ctrl.tipoControladora, ctrl.codigoFireBase) :
            codigoFireBase = await inserirFirebase(ctrl.idControladora, ctrl.descricaoControladora, ctrl.IP, ctrl.quantidadeReles, ctrl.quantidadeSensores, ctrl.tipoControladora);
          
            // Atualiza o codigo Firebase na tabela
            DataBase.updateController(ctrl.idControladora, ctrl.descricaoControladora, ctrl.IP, ctrl.quantidadeReles, ctrl.quantidadeSensores, ctrl.tipoControladora, codigoFireBase)
        });

        // registros criados em outro APP
          // consulta na nuvem
        let controladoras = await consultarFirebase();
        let relays = /* await consultarFirebase(); */ { idControladora: 2, nomeRele: "Rele 99", comandoLigar: "Y", comandoDesligar: "Z", temporizador: 88, statusTemporizador: 0 };
        let sensors = /* await consultarFirebase(); */ { idControladora: 2, nomeSensor: "Sensor 99", comandoLer: 0, comandoResetar: 99 };

        // cria os registros novos. Caso o outro APP tenha atualizado Dados, atualiza aqui.
        controladoras.forEach( (ctrl) => {
            DataBase.insertController(ctrl.data().idControladora, ctrl.data().descricaoControladora, ctrl.data().IP, ctrl.data().quantidadeReles, ctrl.data().quantidadeSensores, ctrl.data().tipoControladora, ctrl.data().codigoFireBase);
        }) 

        /* depois que implementar o insert + update eu volto para este do objeto */
        /* controladoras.forEach( (item) => {
            let ctrl = {
                idControladora : item.data().idControladora,
                descricaoControladora : item.data().descricaoControladora,
                IP : item.data().IP,
                quantidadeReles : item.data().quantidadeReles, 
                quantidadeSensores : item.data().quantidadeSensores,
                tipoControladora : item.data().tipoControladora,
                ativo : item.data().ativo,
                codigoFireBase : item.data().codigoFireBase
            }
            DataBase.insertControllerObject(ctrl, relays, sensors);
        }) */
    }

    const firebaseConfig = {
      apiKey: "AIzaSyCAkLNQ2enwncLZ2-snTQyI2lZhle5pxtA",
      authDomain: "automacao-ethernet.firebaseapp.com",
      projectId: "automacao-ethernet",
      storageBucket: "automacao-ethernet.appspot.com",
      messagingSenderId: "526052405805",
      appId: "1:526052405805:web:cd9f8253a42aabe88b7ea4",
      measurementId: "G-WGD82Q3XS5"
    };
    
    const app = firebase.initializeApp(firebaseConfig);
    const analytics = firebase.analytics(app); 

    return {
        inserirFirebase : inserirFirebase,
        consultarFirebase: consultarFirebase,
        consultarCodigoFirebase : consultarCodigoFirebase,
        atualizarFirebase : atualizarFirebase,
        excluirFirebase : excluirFirebase,
        sincronyzeDataBaseFireBase : sincronyzeDataBaseFireBase,
        firebaseConfig : firebaseConfig,
        app : app,
        analytics : analytics,
        firebase : firebase
    }
});