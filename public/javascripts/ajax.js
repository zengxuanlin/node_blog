function ajax_blog({type='POST',url,data={}}){
    return new Promise(function(resolve,reject){
        $.ajax({
            type,
            url,
            data,
            success(data,status){
                if(status === 'success'){
                    resolve(data)
                }
            },
            error(err){
                reject(err.responseText)
            }
        })
    })
}