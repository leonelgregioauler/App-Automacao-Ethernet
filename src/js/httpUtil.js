define([], 
  function () {
    //function HttpUtil() {
      var self = this;

      async function callGetService (IP, comando) {
      
        let url = `http://${IP}/${comando}`; 
        //const controller = new AbortController();
        //controller.abort();
                
        return new Promise(function(resolve, reject) {

          fetch(url, {
            method: 'GET'
          })
          .then(response =>  {
            return response.json();
          })
          .then((data) => {
            resolve(data);
          })
          .catch((error) => {
            reject(error);
          })
        }) 
      }
      return {
        callGetService
      };
    //}
   //return new HttpUtil();
  });
  