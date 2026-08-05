"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";


type Quote = {
  nightlyRate: number;
  nights: number;
  subtotal: number;
  tax: number;
  total: number;
};


type Fields = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialRequests: string;
};


type Errors = Partial<Record<keyof Fields, string>>;



function validate(f: Fields): Errors {

  const e: Errors = {};


  if (!f.firstName.trim()) {
    e.firstName = "First name is required";
  }


  if (!f.lastName.trim()) {
    e.lastName = "Last name is required";
  }


  if (!f.email.trim()) {

    e.email = "Email is required";

  } 
  else if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)
  ) {

    e.email = "Enter a valid email address";

  }


  if (!f.phone.trim()) {

    e.phone = "Phone number is required";

  } 
  else if (
    !/^\+?[\d\s\-()]{7,15}$/.test(f.phone)
  ) {

    e.phone = "Enter a valid phone number";

  }


  if(f.specialRequests.length > 500){

    e.specialRequests =
      "Special requests cannot exceed 500 characters";

  }


  return e;

}




function fieldCls(hasError?: string){

  return `
    input-field
    ${
      hasError
      ? "border-red-400 focus:border-red-400"
      : "border-sand focus:border-sage"
    }
  `;

}





export function GuestInfoForm({

roomId,
checkIn,
checkOut,
guests,
quote,

}:{

roomId:string;
checkIn:string;
checkOut:string;
guests:string;
quote:Quote|null;

}){


const router = useRouter();



// ===============================
// NIBM2-465 / 466 / 467 / 468
// Authentication State
// ===============================


const [
 isAuthenticated,
 setIsAuthenticated
] = useState(false);



const [
 checkingAuth,
 setCheckingAuth
] = useState(true);





// ===============================
// NIBM2-347
// Guest fields
// ===============================


const [
 fields,
 setFields
] = useState<Fields>({

firstName:"",
lastName:"",
email:"",
phone:"",
specialRequests:"",

});




const [
 errors,
 setErrors
] = useState<Errors>({});



const [
 touched,
 setTouched
] =
useState<
Partial<Record<keyof Fields,boolean>>
>({});




// NIBM2-280 Terms

const [
 agreedTerms,
 setAgreedTerms
] = useState(false);


const [
 termsError,
 setTermsError
] = useState("");




// NIBM2-281

const [
 isSubmitting,
 setIsSubmitting
] = useState(false);







// ===============================
// Check authentication
// ===============================


useEffect(()=>{


async function checkAuthentication(){


try{


const res =
await fetch("/api/auth/session");



const data =
await res.json();



if(data.authenticated){


setIsAuthenticated(true);



// NIBM2-347
// Populate customer details
// but editable


setFields({

firstName:
data.user.firstName || "",

lastName:
data.user.lastName || "",

email:
data.user.email || "",

phone:
data.user.phone || "",

specialRequests:"",

});


}



}
catch(error){

console.error(
"Auth check failed",
error
);

}
finally{

setCheckingAuth(false);

}


}



checkAuthentication();



},[]);






// ===============================
// Restore checkout data
// NIBM2-467
// ===============================


useEffect(()=>{


const saved =
localStorage.getItem(
"checkoutData"
);



if(saved){


try{


const data =
JSON.parse(saved);



if(data.fields){

setFields(data.fields);

}



localStorage.removeItem(
"checkoutData"
);



}
catch(error){

console.error(
"Restore failed",
error
);


}



}


},[]);





function saveCheckoutState(){


localStorage.setItem(

"checkoutData",

JSON.stringify({

roomId,
checkIn,
checkOut,
guests,
quote,
fields,

})

);


}

function set(
  field: keyof Fields,
  value: string
){

const next = {

...fields,

[field]:value,

};


setFields(next);



if(touched[field]){


const e =
validate(next);



setErrors(prev=>({

...prev,

[field]:e[field],

}));


}


}







function touch(
field:keyof Fields
){


setTouched(prev=>({

...prev,

[field]:true,

}));



const e =
validate(fields);



setErrors(prev=>({

...prev,

[field]:e[field],

}));


}







// ===============================
// Handle booking submission
// NIBM2-468
// ===============================


async function handleSubmit(
e:React.FormEvent
){


e.preventDefault();



if(isSubmitting)
return;





// User not authenticated

if(!isAuthenticated){


saveCheckoutState();


router.push(
"/login?redirect=/checkout"
);


return;


}





const allTouched =
Object.fromEntries(

Object.keys(fields).map(k=>[

k,

true

])

) as Record<
keyof Fields,
boolean
>;



setTouched(allTouched);




const errs =
validate(fields);



setErrors(errs);





// Terms validation

if(!agreedTerms){


setTermsError(
"Please accept the Terms & Conditions before continuing"
);


}
else{


setTermsError("");

}





if(
Object.keys(errs).length>0 ||
!agreedTerms
){

return;

}





setIsSubmitting(true);



try{


// Backend authentication check

const response =
await fetch(
"/api/bookings/confirm",
{

method:"POST",

headers:{

"Content-Type":
"application/json",

},


body:JSON.stringify({

roomId,

checkIn,

checkOut,

guests,

quote,


guest:fields,


termsAccepted:
agreedTerms,


})

}

);





if(!response.ok){


throw new Error(
"Booking rejected"
);


}





console.log(
"Booking confirmed"
);



router.push(
"/my-bookings"
);



}
catch(error){


console.error(
"Booking failed",
error
);



setIsSubmitting(false);


}



}





const err =
(field:keyof Fields)=>

touched[field]
?
errors[field]
:
undefined;






return (

<form

onSubmit={handleSubmit}

noValidate

className="
flex
w-full
max-w-2xl
flex-col
gap-[24px]
"

>





{/* =================================
NIBM2-466 Login Prompt
================================= */}


{
!checkingAuth &&
!isAuthenticated &&

(

<div
className="
rounded-lg
border
border-sand
bg-white
p-5
"

>


<h3
className="
font-lora
text-lg
font-medium
text-jungle-dark
"

>

Login Required

</h3>



<p
className="
mt-2
font-outfit
text-sm
text-jungle/70
"

>

Please login or create an account before confirming your booking.

</p>




<button

type="button"

onClick={()=>{


saveCheckoutState();


router.push(
"/login?redirect=/checkout"
);


}}

className="
btn-primary
mt-4
"

>

Login / Sign Up

</button>



</div>

)

}






<div
className="
flex
flex-col
gap-[6px]
"

>


<h2
className="
font-lora
text-[24px]
font-medium
text-jungle-dark
"

>

Guest Information

</h2>



<p
className="
font-outfit
text-field
text-jungle/60
"

>

We will use these details to send your booking confirmation and contact you if needed.

</p>


</div>

<div className="flex flex-col gap-[14px]">


<div className="flex flex-col gap-[14px] sm:flex-row">


<input

type="text"

placeholder="First Name*"

value={fields.firstName}

onChange={(e)=>
set(
"firstName",
e.target.value
)
}

onBlur={()=>
touch("firstName")
}

className={`
flex-1
min-w-0
${fieldCls(
err("firstName")
)}
`}

/>




<input

type="text"

placeholder="Last Name*"

value={fields.lastName}

onChange={(e)=>
set(
"lastName",
e.target.value
)
}

onBlur={()=>
touch("lastName")
}

className={`
flex-1
min-w-0
${fieldCls(
err("lastName")
)}
`}

/>


</div>






<div className="flex flex-col gap-[14px] sm:flex-row">


<input

type="email"

placeholder="Email Address*"

value={fields.email}

onChange={(e)=>
set(
"email",
e.target.value
)
}

onBlur={()=>
touch("email")
}

className={`
flex-1
min-w-0
${fieldCls(
err("email")
)}
`}

/>





<input

type="tel"

placeholder="Phone Number*"

value={fields.phone}

onChange={(e)=>
set(
"phone",
e.target.value
)
}

onBlur={()=>
touch("phone")
}

className={`
flex-1
min-w-0
${fieldCls(
err("phone")
)}
`}

/>



</div>






<div className="flex flex-col gap-[4px]">


<textarea


placeholder="Special Requests (optional)"


value={
fields.specialRequests
}


onChange={(e)=>

set(
"specialRequests",
e.target.value
)

}


onBlur={()=>

touch(
"specialRequests"
)

}


rows={4}


maxLength={500}


className={`

w-full

resize-none

rounded-input

border-2

bg-white

px-field-x

py-4

font-outfit

text-field

text-jungle

${
err("specialRequests")

?

"border-red-400 focus:border-red-400"

:

"border-sand focus:border-sage"

}

`}


/>





<span
className="
self-end
font-outfit
text-[12px]
text-jungle/45
"

>

{
fields.specialRequests.length
}

/500

</span>



</div>



</div>








{/* ===============================
NIBM2-280 Terms and Conditions
=============================== */}



<div
className="
flex
flex-col
gap-2
"

>


<label
className="
flex
items-start
gap-3
font-outfit
text-sm
text-jungle
"

>


<input


type="checkbox"


checked={
agreedTerms
}


onChange={(e)=>{


setAgreedTerms(
e.target.checked
);



if(e.target.checked){

setTermsError("");

}


}}


className="
mt-1
h-4
w-4
"

/>



<span>


I agree to the{" "}



<a

href="/terms"

target="_blank"

className="
text-blue-600
underline
"

>

Terms & Conditions

</a>



{" "}and confirm that my booking details are correct.


</span>


</label>






{
termsError &&

<p
className="
font-outfit
text-sm
text-red-500
"

>

{termsError}

</p>

}



</div>









{/* ===============================
Booking CTA
NIBM2-465
=============================== */}



<button


type="submit"



disabled={

checkingAuth ||

isSubmitting ||

!isAuthenticated

}



className="

btn-primary

sm:w-auto

sm:self-start

sm:px-10

disabled:opacity-50

disabled:cursor-not-allowed

"



>


{


checkingAuth

?

"Checking Account..."

:

!isAuthenticated

?

"Login Required"

:

isSubmitting

?

"Processing Payment..."

:

"Pay & Book"



}



</button>





</form>


);


}