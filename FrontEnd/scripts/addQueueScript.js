function createQueue() {
    // Get the form values
    let name = document.getElementById('name').value;
    let description = document.getElementById('description').value;

    // Create the request body
    let requestBody = {
        command: "create",
        arguments: {
            name: name,
            description: description
        }
    };

    // Send the PUT request
    fetch(ip + '/queues', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    })
    .then(function(response) {
        if (response.ok) {
            console.log('Queue created successfully!');
        } else {
            alert('Error creating queue. Please try again.');
        }
    })
    .catch(function(error) {
        alert('Error creating queue. Please try again.');
        console.error(error);
    });
}