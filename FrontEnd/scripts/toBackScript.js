let ip = "http://localhost:8000"

function getQueueList(){
    return new Promise((resolve, reject) => {
        $.ajax({
            url: ip + "/queues",
            type: "GET",
            success: function(data){
                resolve(data);
            },
            error: function(err){
                reject(err);
            }
        });
    });
}