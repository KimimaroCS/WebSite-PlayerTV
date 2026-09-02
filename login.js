/* =========================================================
   CODE ADMIN NEXIUMFILMS
========================================================= */


/*
   🔐 CHANGE TON CODE ICI
*/

const ADMIN_CODE =
    "NEXIUM-2026";


/* =========================================================
   SI DEJA CONNECTE
========================================================= */

if (
    sessionStorage.getItem(
        "nexium_admin_auth"
    ) === "1"
) {

    window.location.replace(
        "admin.html"
    );

}


/* =========================================================
   CONNEXION
========================================================= */

function login() {

    const input =
        document.getElementById(
            "adminCode"
        );


    const error =
        document.getElementById(
            "error"
        );


    const code =
        input.value;


    if (
        code === ADMIN_CODE
    ) {

        sessionStorage.setItem(
            "nexium_admin_auth",
            "1"
        );


        window.location.replace(
            "admin.html"
        );


        return;

    }


    error.textContent =
        "❌ Code incorrect.";


    input.value = "";


    input.focus();

}


/* =========================================================
   BOUTON
========================================================= */

document
    .getElementById(
        "loginButton"
    )
    .addEventListener(
        "click",
        login
    );


/* =========================================================
   ENTER
========================================================= */

document
    .getElementById(
        "adminCode"
    )
    .addEventListener(
        "keydown",
        function(event) {

            if (
                event.key === "Enter"
            ) {

                login();

            }

        }
    );