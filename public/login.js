var xhr = new XMLHttpRequest();

function login()
{
    var username = $("#username").val();
    var password = $("#password").val();
    var data = {
        username:username,
        password:password
    }
    xhr.open('POST','/login',true);
    xhr.setRequestHeader('content-type','application/json');
    xhr.onload = function()
    {
       var response = JSON.parse(xhr.responseText);
       if(response.code === 200)
       {
           if(response.role === 1)
        {
            location.href = "manufacture.html";
        }
        if(response.role === 2)
        {
            location.href = "supplier.html";
        }
        if(response.role === 3)
        {
            location.href = "user.html";
        }
        }
        else{
            alert(response.status);
        }
    }
    xhr.send(JSON.stringify(data));
}
window.onload = function() {
    $("#login").click(function() {
    
        login();
        //getAllContract();
      });
    };