class Apierror extends Error{
    constructor(statuscode,
        message="Something wrong",
        error=[],
        stack =""
    ){
        super(message)
        this.statuscode = statuscode
        this.data=null
        this.message= message
        this.success=false;
        this.error=error;
        
    }
}

export {Apierror}