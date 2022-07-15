define(['fireBase'],
  function (FireBase) {

    function createDataBase () { 
        try {
            db = openDatabase ('App-Industria-4.0', 1.0, 'App Indústria 4.0', 2 * 1024 * 1024);
            // Migração SQLite
            //db = window.sqlitePlugin.openDatabase ({name: 'App-Industria-4.0', location: 'default'});

            db.transaction(function(tx) {
                tx.executeSql('CREATE TABLE IF NOT EXISTS CONTROLADORAS (idControladora INTEGER PRIMARY KEY AUTOINCREMENT, descricaoControladora VARCHAR2(100) NOT NULL, IP VARCHAR2(100) NOT NULL, quantidadeReles INTEGER NOT NULL, quantidadeSensores INTEGER NOT NULL, tipoControladora VARCHAR2(20), ativo BOOLEAN, codigoFireBase VARCHAR2(40), UNIQUE (codigoFireBase))');
                tx.executeSql('CREATE TABLE IF NOT EXISTS RELES_CONTROLADORA (idReleControladora INTEGER PRIMARY KEY AUTOINCREMENT, idControladora INTEGER NOT NULL, nomeRele VARCHAR2(100), comandoLigar VARCHAR2(10), comandoDesligar VARCHAR2(10), temporizador NUMBER, statusTemporizador NUMBER, FOREIGN KEY (idControladora) REFERENCES CONTROLADORAS (idControladora))');
                tx.executeSql('CREATE TABLE IF NOT EXISTS SENSORES_CONTROLADORA (idSensorControladora INTEGER PRIMARY KEY AUTOINCREMENT, idControladora INTEGER NOT NULL, nomeSensor VARCHAR2(100), comandoLer VARCHAR2(10), comandoResetar VARCHAR2(10), FOREIGN KEY (idControladora) REFERENCES CONTROLADORAS (idControladora))');
                tx.executeSql('CREATE TABLE IF NOT EXISTS LOG_ACIONAMENTOS (idLogAcionamento INTEGER PRIMARY KEY AUTOINCREMENT, idControladora INTEGER NOT NULL, numeroMAC VARCHAR2(50), dataRegistro DATE, diaRegistro NUMBER, mesRegistro NUMBER, anoRegistro NUMBER, horaRegistro NUMBER, FOREIGN KEY (idControladora) REFERENCES CONTROLADORAS (idControladora), UNIQUE (dataRegistro, horaRegistro))');
                tx.executeSql('CREATE TABLE IF NOT EXISTS LOG_ACIONAMENTOS_SENSORES (idLogAcionamentoSensor INTEGER PRIMARY KEY AUTOINCREMENT, idLogAcionamento INTEGER NOT NULL, idSensorControladora INTEGER, contadorSensor INTEGER, FOREIGN KEY (idLogAcionamento) REFERENCES LOG_ACIONAMENTOS (idLogAcionamento), FOREIGN KEY (idSensorControladora) REFERENCES SENSORES_CONTROLADORA (idSensorControladora))'); 
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
                tx.executeSql('DROP TABLE LOG_ACIONAMENTOS');
                tx.executeSql('DROP TABLE LOG_ACIONAMENTOS_SENSORES');
            });
        } catch (err) {
        alert ('Erro ao remover tabelas '+ err);
        }
    }

    function insertController (idControladora, descricaoControladora, IP, quantidadeReles, quantidadeSensores, tipoControladora, codigoFireBase) {
        try {
            db = openDatabase ('App-Industria-4.0', 1.0, 'App Indústria 4.0', 2 * 1024 * 1024);
            // Migração SQLite
            //db = window.sqlitePlugin.openDatabase ({name: 'App-Industria-4.0', location: 'default'});

            const ativo = 'S';

            db.transaction(function(tx) {

                tx.executeSql(`INSERT OR REPLACE INTO CONTROLADORAS (idControladora, descricaoControladora, IP, quantidadeReles, quantidadeSensores, tipoControladora, ativo, codigoFireBase) VALUES (\'${idControladora}\', \'${descricaoControladora}\', \'${IP}\', \'${quantidadeReles}\', \'${quantidadeSensores}\', \'${tipoControladora}\', \'${ativo}\', \'${codigoFireBase}\')`
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

    function insertControllerObject (controller, relay, sensor) {
        try {
            db = openDatabase ('App-Industria-4.0', 1.0, 'App Indústria 4.0', 2 * 1024 * 1024);
            // Migração SQLite
            //db = window.sqlitePlugin.openDatabase ({name: 'App-Industria-4.0', location: 'default'});

            db.transaction(function(tx) {
                tx.executeSql(`INSERT INTO CONTROLADORAS (idControladora, descricaoControladora, IP, quantidadeReles, quantidadeSensores, tipoControladora, ativo, codigoFireBase) VALUES (\'${controller.idControladora}\', \'${controller.descricaoControladora}\', \'${controller.IP}\', \'${controller.quantidadeReles}\', \'${controller.quantidadeSensores}\', \'${controller.tipoControladora}\', \'${controller.ativo}\', \'${controller.codigoFireBase}\')`
                             , [], function(tx, result) {

                    //insertControllerRelay(relay.idControladora, 'Rele: ' + relay.numeroRele, relay.comandoLigar, relay.comandoDesligar, relay.temporizador, relay.statusTemporizador);
                    
                    //insertControllerSensor(sensor.idControladora, 'Sensor: ' + sensor.numeroSensor, sensor.comandoLer, sensor.comandoResetar);
                                 
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

    function initializeLogTriggering (dataLog) {
        try {
            db = openDatabase ('App-Industria-4.0', 1.0, 'App Indústria 4.0', 2 * 1024 * 1024);
            // Migração SQLite
            //db = window.sqlitePlugin.openDatabase ({name: 'App-Industria-4.0', location: 'default'});
            const date = new Date();
            const diaRegistro = date.getDate();
            const mesRegistro = date.getMonth() + 1;
            const anoRegistro = date.getFullYear();
            const dataRegistro = date.toLocaleDateString('pt-br');

            const horasDia = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
            
            let idLogAcionamento = 0;

            db.transaction(function(tx) {
                dataLog.forEach( (item) => {
                    for (i of horasDia) {
                      tx.executeSql(`INSERT INTO LOG_ACIONAMENTOS (idControladora, numeroMAC, dataRegistro, diaRegistro, mesRegistro, anoRegistro, horaRegistro) VALUES (\'${item.idControladora}\', \'${item.numeroMac}\', \'${dataRegistro}\', \'${diaRegistro}\', \'${mesRegistro}\', \'${anoRegistro}\', \'${i}\')`
                        , [], function(tx, result) {

                            idLogAcionamento = result.insertId;

                            initializeLogTriggeringSensor(idLogAcionamento, item.sensores, tx);

                      }, null);
                    }
                })
            });
        } catch (err) {
            alert ('Erro ao registrar o log da controladora'+ err);
        }
    }

    function initializeLogTriggeringSensor (idLogAcionamento, sensores, tx) {
        try {
            sensores.forEach( (sensor) => {
              tx.executeSql(`INSERT INTO LOG_ACIONAMENTOS_SENSORES (idLogAcionamento, idSensorControladora, contadorSensor) VALUES (\'${idLogAcionamento}\', \'${sensor.idSensorControladora}\', 0) `);
            })
        } catch (err) {
        alert ('Erro ao cadastrar o relé da controladora'+ err);
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
                        
                        for (let i = 0; i < result.rows.length; i++) {
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
                                tipoControladora: item.tipoControladora,
                                codigoFireBase: item.codigoFireBase
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
                        
                        for (relay of result.rows) {
                            console.log(result.rows);
                            configurationRelay.push(relay);
                        }

                        configurationRelayMap = configurationRelay.map((item) => {
                            return {
                                idReleControladora: item.idReleControladora,
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
                                idSensorControladora: item.idSensorControladora,
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

    function queryLogTriggering (query) {
        var logSensor = [];
        var logSensorMap = [];
        try {
            db = openDatabase ('App-Industria-4.0', 1.0, 'App Indústria 4.0', 2 * 1024 * 1024);
            // Migração SQLite
            //db = window.sqlitePlugin.openDatabase ({name: 'App-Industria-4.0', location: 'default'});

            return new Promise( (resolve, reject) => {

                db.transaction(function(tx) {
                    tx.executeSql(query, [], function(tx, result) {
                        
                        for (log of result.rows) {
                            logSensor.push(log);
                        }

                        logSensorMap = logSensor.map((item) => {
                            return {
                                idLogAcionamento: item.idLogAcionamento,
                                idControladora: item.idControladora,
                                numeroMAC: item.numeroMAC,
                                dataRegistro: item.dataRegistro,
                                diaRegistro: item.diaRegistro,
                                mesRegistro: item.mesRegistro,
                                anoRegistro: item.anoRegistro,
                                horaRegistro: item.horaRegistro
                            }
                        })
                        resolve(logSensorMap);
                    }, reject);
                });
            });
        } catch (err) {
          alert('Erro ao consultar o sensor da controladora ' + err);
        }
        return configurationSensor;
    }

    function queryLogTriggeringSensor (query) {
        var logSensor = [];
        var logSensorMap = [];
        try {
            db = openDatabase ('App-Industria-4.0', 1.0, 'App Indústria 4.0', 2 * 1024 * 1024);
            // Migração SQLite
            //db = window.sqlitePlugin.openDatabase ({name: 'App-Industria-4.0', location: 'default'});

            return new Promise( (resolve, reject) => {

                db.transaction(function(tx) {
                    tx.executeSql(query, [], function(tx, result) {
                        
                        for (log of result.rows) {
                            logSensor.push(log);
                        }

                        logSensorMap = logSensor.map((item) => {
                            return {
                                idLogAcionamentoSensor: item.idLogAcionamentoSensor,
                                idLogAcionamento: item.idLogAcionamento,
                                idControladora: item.idControladora,
                                numeroMAC: item.numeroMAC,
                                dataRegistro: item.dataRegistro,
                                diaRegistro: item.diaRegistro,
                                mesRegistro: item.mesRegistro,
                                anoRegistro: item.anoRegistro,
                                horaRegistro: item.horaRegistro,
                                idLogAcionamento: item.idLogAcionamento,
                                idSensorControladora: item.idSensorControladora,
                                nomeSensor: item.nomeSensor,
                                contadorSensor: item.contadorSensor
                            }
                        })
                        resolve(logSensorMap);
                    }, reject);
                });
            });
        } catch (err) {
          alert('Erro ao consultar o sensor da controladora ' + err);
        }
        return configurationSensor;
    }
    
    function updateController (idControladora, descricaoControladora, IP, quantidadeReles, quantidadeSensores, tipoControladora, codigoFireBase) {
        try {
            db = openDatabase ('App-Industria-4.0', 1.0, 'App Indústria 4.0', 2 * 1024 * 1024);
            // Migração SQLite
            //db = window.sqlitePlugin.openDatabase ({name: 'App-Industria-4.0', location: 'default'});

            db.transaction(function(tx) {
                tx.executeSql(`UPDATE CONTROLADORAS SET descricaoControladora = \'${descricaoControladora}\', IP = \'${IP}\', quantidadeReles = ${quantidadeReles}, quantidadeSensores = ${quantidadeSensores}, tipoControladora = \'${tipoControladora}\', codigoFireBase = \'${codigoFireBase}\' WHERE idControladora = ${idControladora}`);
            });
        } catch (err) {
        alert ('Erro ao atualizar a controladora '+ err);
        }
    }

    function updateControllerRelay (idReleControladora, nomeRele, comandoLigar, comandoDesligar, temporizador, statusTemporizador) {
        try {
            db = openDatabase ('App-Industria-4.0', 1.0, 'App Indústria 4.0', 2 * 1024 * 1024);
            // Migração SQLite
            //db = window.sqlitePlugin.openDatabase ({name: 'App-Industria-4.0'});

            db.transaction(function(tx) {
                tx.executeSql(`UPDATE RELES_CONTROLADORA SET nomeRele = \'${nomeRele}\', comandoLigar = \'${comandoLigar}\', comandoDesligar = \'${comandoDesligar}\', temporizador = \'${temporizador}\', statusTemporizador = \'${statusTemporizador}\' WHERE idReleControladora = ${idReleControladora}`);
            });
        } catch (err) {
        alert ('Erro ao atualizar o relé da controladora '+ err);
        }
    }

    function updateControllerSensor (idSensorControladora, nomeSensor, comandoLer, comandoResetar) {
        try {
            db = openDatabase ('App-Industria-4.0', 1.0, 'App Indústria 4.0', 2 * 1024 * 1024);
            // Migração SQLite
            //db = window.sqlitePlugin.openDatabase ({name: 'App-Industria-4.0', location: 'default'});

            db.transaction(function(tx) {
                tx.executeSql(`UPDATE SENSORES_CONTROLADORA SET nomeSensor = \'${nomeSensor}\', comandoLer = \'${comandoLer}\', comandoResetar = \'${comandoResetar}\' WHERE idSensorControladora = ${idSensorControladora}`);
            });
        } catch (err) {
        alert ('Erro ao atualizar o sensor da controladora '+ err);
        }
    }

    function updateLogTriggeringSensor (dataLog) {
        try {
            db = openDatabase ('App-Industria-4.0', 1.0, 'App Indústria 4.0', 2 * 1024 * 1024);
            // Migração SQLite
            //db = window.sqlitePlugin.openDatabase ({name: 'App-Industria-4.0', location: 'default'});
            
            const date = new Date();
            const horaRegistro = date.getHours();
            const dataRegistro = date.toLocaleDateString('pt-br');

            queryLogTriggering(`SELECT idLogAcionamento FROM LOG_ACIONAMENTOS WHERE dataRegistro = \'${dataRegistro}\' AND horaRegistro = \'${horaRegistro}\' `).then( (idLog) => {
                
                db.transaction(function(tx) {
                    dataLog.forEach( (ctrl) => {
                        ctrl.sensores.forEach( (item) => {
                            tx.executeSql(`UPDATE LOG_ACIONAMENTOS_SENSORES SET contadorSensor = \'${parseInt(item.contadorSensor)}\' WHERE idLogAcionamento = \'${idLog[0].idLogAcionamento}\' AND idSensorControladora = \'${item.idSensorControladora}\' `);
                        })
                    })
                });
            })
        } catch (err) {
        alert ('Erro ao cadastrar o relé da controladora'+ err);
        }
    }

    function deleteController (idControladora) {
        try {
            db = openDatabase ('App-Industria-4.0', 1.0, 'App Indústria 4.0', 2 * 1024 * 1024);
            // Migração SQLite
            //db = window.sqlitePlugin.openDatabase ({name: 'App-Industria-4.0'});

            db.transaction(function(tx) {
                tx.executeSql(`DELETE FROM LOG_ACIONAMENTO_SENSORES WHERE idControladora = ${idControladora}`);
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
             insertControllerObject: insertControllerObject,
             insertControllerRelay: insertControllerRelay,
             insertControllerSensor: insertControllerSensor,
             initializeLogTriggering: initializeLogTriggering,
             updateLogTriggeringSensor: updateLogTriggeringSensor,

             queryController: queryController,
             queryControllerRelay: queryControllerRelay,
             queryControllerSensor: queryControllerSensor,
             queryLogTriggering: queryLogTriggering,
             queryLogTriggeringSensor: queryLogTriggeringSensor,

             updateController: updateController,
             updateControllerRelay: updateControllerRelay,
             updateControllerSensor: updateControllerSensor,

             deleteController: deleteController
           };
  }
);
