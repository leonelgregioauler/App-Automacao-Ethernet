define([],
  function () {

    function createDataBase () { 
        try {
            db = openDatabase ('App-Industria-4.0', 1.0, 'App Indústria 4.0', 2 * 1024 * 1024);
            // Migração SQLite
            //db = window.sqlitePlugin.openDatabase ({name: 'App-Industria-4.0', location: 'default'});

            db.transaction(function(tx) {
                tx.executeSql('CREATE TABLE IF NOT EXISTS CONTROLADORAS (idControladora INTEGER PRIMARY KEY AUTOINCREMENT, descricaoControladora VARCHAR2(100), IP VARCHAR2(100) NOT NULL, quantidadeReles INTEGER, quantidadeSensores INTEGER, tipoControladora VARCHAR2(20))');
                tx.executeSql('CREATE TABLE IF NOT EXISTS RELES_CONTROLADORA (idRelesControladora INTEGER PRIMARY KEY AUTOINCREMENT, idControladora INTEGER NOT NULL, nomeRele VARCHAR2(100), comandoLigar VARCHAR2(10), comandoDesligar VARCHAR2(10), temporizador NUMBER, statusTemporizador NUMBER, FOREIGN KEY (idControladora) REFERENCES CONTROLADORAS (idControladora))');
                tx.executeSql('CREATE TABLE IF NOT EXISTS SENSORES_CONTROLADORA (idSensoresControladora INTEGER PRIMARY KEY AUTOINCREMENT, idControladora INTEGER NOT NULL, nomeSensor VARCHAR2(100), comandoLer VARCHAR2(10), comandoResetar VARCHAR2(10), FOREIGN KEY (idControladora) REFERENCES CONTROLADORAS (idControladora))');
                console.warn("Banco de Dados criado");
            });
        } catch (err) {
          alert ('Erro ao criar tabelas '+ err);
        }
    }

    function dropDataBase ()  {
        try {
            db = openDatabase ('App-Industria-4.0', 1.0, 'App Indústria 4.0', 2 * 1024 * 1024);
            // Migração SQLite
            //db = window.sqlitePlugin.openDatabase ({name: 'App-Industria-4.0', location: 'default'});

            db.transaction(function(tx) {
                tx.executeSql('DROP TABLE CONTROLADORAS');
                tx.executeSql('DROP TABLE RELES_CONTROLADORA');
                tx.executeSql('DROP TABLE SENSORES_CONTROLADORA');
            });
        } catch (err) {
        alert ('Erro ao remover tabelas '+ err);
        }
    }

    function insertController (descricaoControladora, IP, quantidadeReles, quantidadeSensores, tipoControladora) {
        try {
            db = openDatabase ('App-Industria-4.0', 1.0, 'App Indústria 4.0', 2 * 1024 * 1024);
            // Migração SQLite
            //db = window.sqlitePlugin.openDatabase ({name: 'App-Industria-4.0', location: 'default'});

            db.transaction(function(tx) {
                tx.executeSql(`INSERT INTO CONTROLADORAS (descricaoControladora, IP, quantidadeReles, quantidadeSensores, tipoControladora) VALUES (\'${descricaoControladora}\', \'${IP}\', \'${quantidadeReles}\', \'${quantidadeSensores}\', \'${tipoControladora}\')`
                             , [], function(tx, result) {

                    let numeroRele = 0;
                    let comandoLigar = 'X';
                    let comandoDesligar = 'x';
                    let temporizador = 0;
                    let statusTemporizador = 0;
                    
                    let numeroSensor = 0;
                    let comandoLer = 0;
                    let comandoResetar = 0;
                    
                    let idControladora = result.insertId;
      
                    for (let i = 0; i < quantidadeReles; i++) {
                        numeroRele = i + 1;
                        insertControllerRelay(idControladora, 'Rele: ' + numeroRele, comandoLigar, comandoDesligar, temporizador, statusTemporizador);
                    }

                    for (let i = 0; i < quantidadeSensores; i++) {
                        numeroSensor = i + 1;
                        comandoResetar = i + 1;
                        insertControllerSensor(idControladora, 'Sensor: ' + numeroSensor, comandoLer, comandoResetar);
                    }
                                 
                }, null);
                
            
            });
        } catch (err) {
        alert ('Erro ao cadastrar a controladora'+ err);
        }
    }

    function insertControllerRelay (idControladora, nomeRele, comandoLigar, comandoDesligar, temporizador, statusTemporizador) {
        try {
            db = openDatabase ('App-Industria-4.0', 1.0, 'App Indústria 4.0', 2 * 1024 * 1024);
            // Migração SQLite
            //db = window.sqlitePlugin.openDatabase ({name: 'App-Industria-4.0', location: 'default'});

            db.transaction(function(tx) {
                tx.executeSql(`INSERT INTO RELES_CONTROLADORA (idControladora, nomeRele, comandoLigar, comandoDesligar, temporizador, statusTemporizador) VALUES (\'${idControladora}\', \'${nomeRele}\', \'${comandoLigar}\', \'${comandoDesligar}\', \'${temporizador}\', \'${statusTemporizador}\')`);
            });
        } catch (err) {
        alert ('Erro ao cadastrar o relé da controladora'+ err);
        }
    }

    function insertControllerSensor (idControladora, nomeSensor, comandoLer, comandoResetar) {
        try {
            db = openDatabase ('App-Industria-4.0', 1.0, 'App Indústria 4.0', 2 * 1024 * 1024);
            // Migração SQLite
            //db = window.sqlitePlugin.openDatabase ({name: 'App-Industria-4.0', location: 'default'});

            db.transaction(function(tx) {
                tx.executeSql(`INSERT INTO SENSORES_CONTROLADORA (idControladora, nomeSensor, comandoLer, comandoResetar) VALUES (\'${idControladora}\', \'${nomeSensor}\', \'${comandoLer}\', \'${comandoResetar}\')`);
            });
        } catch (err) {
        alert ('Erro ao cadastrar o sensor da controladora'+ err);
        }
    }

    function queryController (query) {
        var configuration = [];
        var configurationMap = [];
        try {
            db = openDatabase ('App-Industria-4.0', 1.0, 'App Indústria 4.0', 2 * 1024 * 1024);
            // Migração SQLite
            //db = window.sqlitePlugin.openDatabase ({name: 'App-Industria-4.0', location: 'default'});

            return new Promise( (resolve, reject) => {
                db.transaction(function(tx) {
                    tx.executeSql(query, [], function(tx, result) {
                        
                        for (i of result.rows) {
                            configuration.push(result.rows.item(i));
                        }

                        configurationMap = configuration.map((item) => {
                            return {
                                value: item.idControladora,
                                label: item.descricaoControladora, 
                                idControladora: item.idControladora,
                                descricaoControladora: item.descricaoControladora,
                                IP: item.IP,
                                quantidadeReles: parseInt(item.quantidadeReles),
                                quantidadeSensores: parseInt(item.quantidadeSensores),
                                tipoControladora: item.tipoControladora
                            }
                        })
                        resolve(configurationMap);
                    }, reject)
                })
            });
        } catch (err) {
          alert ('Erro ao consultar a controladora ' + err);
        }
        return configuration;
    }

    function queryControllerRelay (query) {
        var configurationRelay = [];
        var configurationRelayMap = [];
        try {
            db = openDatabase ('App-Industria-4.0', 1.0, 'App Indústria 4.0', 2 * 1024 * 1024);
            // Migração SQLite
            //db = window.sqlitePlugin.openDatabase ({name: 'App-Industria-4.0', location: 'default'});

            return new Promise( (resolve, reject) => {

                db.transaction(function(tx) {
                    tx.executeSql(query, [], function(tx, result) {
                        
                        debugger;
                        for (relay of result.rows) {
                            console.log(result.rows);
                            configurationRelay.push(relay);
                        }


                        configurationRelayMap = configurationRelay.map((item) => {
                            return {
                                idRelesControladora: item.idRelesControladora,
                                idControladora: item.idControladora,
                                nomeRele: item.nomeRele,
                                comandoLigar: item.comandoLigar,
                                comandoDesligar: item.comandoDesligar,
                                temporizador: item.temporizador,
                                statusTemporizador: item.statusTemporizador
                            }
                        })
                        resolve(configurationRelayMap);
                    }, reject);
                });
            });
        } catch (err) {
          alert ('Erro ao consultar o relé da controladora ' + err);
        }
        return configurationRelay;
    }

    function queryControllerSensor (query) {
        var configurationSensor = [];
        var configurationSensorMap = [];
        try {
            db = openDatabase ('App-Industria-4.0', 1.0, 'App Indústria 4.0', 2 * 1024 * 1024);
            // Migração SQLite
            //db = window.sqlitePlugin.openDatabase ({name: 'App-Industria-4.0', location: 'default'});

            return new Promise( (resolve, reject) => {

                db.transaction(function(tx) {
                    tx.executeSql(query, [], function(tx, result) {
                        
                        for (sensor of result.rows) {
                            configurationSensor.push(sensor);
                        }

                        configurationSensorMap = configurationSensor.map((item) => {
                            return {
                                idSensoresControladora: item.idSensoresControladora,
                                idControladora: item.idControladora,
                                nomeSensor: item.nomeSensor,
                                comandoLer: item.comandoLer,
                                comandoResetar: item.comandoResetar
                            }
                        })
                        resolve(configurationSensorMap);
                    }, reject);
                });
            });
        } catch (err) {
          alert('Erro ao consultar o sensor da controladora ' + err);
        }
        return configurationSensor;
    }
    
    function updateController (idControladora, descricaoControladora, IP, quantidadeReles, tipoControladora) {
        try {
            db = openDatabase ('App-Industria-4.0', 1.0, 'App Indústria 4.0', 2 * 1024 * 1024);
            // Migração SQLite
            //db = window.sqlitePlugin.openDatabase ({name: 'App-Industria-4.0', location: 'default'});

            db.transaction(function(tx) {
                tx.executeSql(`UPDATE CONTROLADORAS SET descricaoControladora = \'${descricaoControladora}\', IP = \'${IP}\', quantidadeReles = ${quantidadeReles}, tipoControladora = \'${tipoControladora}\' WHERE idControladora = ${idControladora}`);
            });
        } catch (err) {
        alert ('Erro ao atualizar a controladora '+ err);
        }
    }

    function updateControllerRelay (idRelesControladora, nomeRele, comandoLigar, comandoDesligar, temporizador, statusTemporizador) {
        try {
            db = openDatabase ('App-Industria-4.0', 1.0, 'App Indústria 4.0', 2 * 1024 * 1024);
            // Migração SQLite
            //db = window.sqlitePlugin.openDatabase ({name: 'App-Industria-4.0'});

            db.transaction(function(tx) {
                tx.executeSql(`UPDATE RELES_CONTROLADORA SET nomeRele = \'${nomeRele}\', comandoLigar = \'${comandoLigar}\', comandoDesligar = \'${comandoDesligar}\', temporizador = \'${temporizador}\', statusTemporizador = \'${statusTemporizador}\' WHERE idRelesControladora = ${idRelesControladora}`);
            });
        } catch (err) {
        alert ('Erro ao atualizar o relé da controladora '+ err);
        }
    }

    function updateControllerSensor (idSensoresControladora, nomeSensor, comandoLer, comandoResetar) {
        try {
            db = openDatabase ('App-Industria-4.0', 1.0, 'App Indústria 4.0', 2 * 1024 * 1024);
            // Migração SQLite
            //db = window.sqlitePlugin.openDatabase ({name: 'App-Industria-4.0', location: 'default'});

            db.transaction(function(tx) {
                tx.executeSql(`UPDATE SENSORES_CONTROLADORA SET nomeSensor = \'${nomeSensor}\', comandoLer = \'${comandoLer}\', comandoResetar = \'${comandoResetar}\' WHERE idSensoresControladora = ${idSensoresControladora}`);
            });
        } catch (err) {
        alert ('Erro ao atualizar o sensor da controladora '+ err);
        }
    }

    function deleteController (idControladora) {
        try {
            db = openDatabase ('App-Industria-4.0', 1.0, 'App Indústria 4.0', 2 * 1024 * 1024);
            // Migração SQLite
            //db = window.sqlitePlugin.openDatabase ({name: 'App-Industria-4.0'});

            db.transaction(function(tx) {
                tx.executeSql(`DELETE FROM SENSORES_CONTROLADORA WHERE idControladora = ${idControladora}`);
                tx.executeSql(`DELETE FROM RELES_CONTROLADORA WHERE idControladora = ${idControladora}`);
                tx.executeSql(`DELETE FROM CONTROLADORAS WHERE idControladora = ${idControladora}`);
            });
        } catch (err) {
        alert ('Erro ao remover a controladora '+ err);
        }
    }

    return { 
             createDataBase: createDataBase,
             dropDataBase: dropDataBase,

             insertController: insertController,
             insertControllerRelay: insertControllerRelay,
             insertControllerSensor: insertControllerSensor,

             queryController: queryController,
             queryControllerRelay: queryControllerRelay,
             queryControllerSensor: queryControllerSensor,

             updateController: updateController,
             updateControllerRelay: updateControllerRelay,
             updateControllerSensor: updateControllerSensor,

             deleteController: deleteController
           };
  }
);
