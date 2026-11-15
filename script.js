
/* PODACI O MENIJU */

const menu = {
    kava: [
        { name: "Espresso", description: "Klasična kratka kava intenzivnog okusa.", price: "1,50 €" },
        { name: "Macchiato", description: "Espresso s malo toplog mlijeka.", price: "1,70 €" },
        { name: "Cappuccino", description: "Espresso s kremastom mliječnom pjenom.", price: "2,00 €" },
        { name: "Bijela kava", description: "Blaga kava s toplim mlijekom.", price: "2,20 €" },
        { name: "Latte Macchiato", description: "Mlijeko, espresso i nježna pjena.", price: "2,50 €" },
        { name: "Kava bez kofeina", description: "Uživanje u kavi bez kofeina.", price: "1,80 €" }
    ],

    hladni: [
        { name: "Ledena kava", description: "Ohlađena kava sa sladoledom.", price: "3,50 €" },
        { name: "Limunada", description: "Svježa domaća limunada.", price: "2,50 €" },
        { name: "Cijeđena naranča", description: "Svježe cijeđeni sok od naranče.", price: "3,00 €" },
        { name: "Ledeni čaj", description: "Osvježavajući čaj s limunom.", price: "2,50 €" },
        { name: "Milkshake", description: "Kremasti napitak po izboru.", price: "3,50 €" },
        { name: "Mineralna voda", description: "Gazirana ili negazirana voda.", price: "2,00 €" }
    ],

    slastice: [
        { name: "Cheesecake", description: "Kremasti kolač sa šumskim voćem.", price: "3,50 €" },
        { name: "Čokoladna torta", description: "Bogata čokoladna torta.", price: "3,80 €" },
        { name: "Palačinke", description: "S čokoladom ili marmeladom.", price: "3,50 €" },
        { name: "Kroasan", description: "Svježi maslac kroasan.", price: "2,00 €" },
        { name: "Muffin", description: "Mekani muffin s komadićima čokolade.", price: "2,50 €" },
        { name: "Tiramisu", description: "Talijanski desert s kavom.", price: "3,80 €" }
    ],

    dorucak: [
        { name: "Klasični doručak", description: "Jaja, tost, maslac i sir.", price: "6,50 €" },
        { name: "Sendvič sa šunkom", description: "Tost, šunka, sir i povrće.", price: "4,50 €" },
        { name: "Avokado tost", description: "Tost s avokadom i jajetom.", price: "6,00 €" },
        { name: "Palačinke s voćem", description: "Palačinke sa svježim voćem.", price: "5,00 €" },
        { name: "Granola", description: "Jogurt, granola i sezonsko voće.", price: "4,50 €" },
        { name: "Omlet", description: "Omlet sa sirom i povrćem.", price: "5,50 €" }
    ]
};


/* PRIKAZ MENIJA */

const menuItems = document.getElementById("menuItems");
const menuTabs = document.querySelectorAll(".menu-tab");

function showMenu(category) {
    menuItems.innerHTML = "";

    menu[category].forEach(item => {
        const menuItem = document.createElement("div");
        menuItem.classList.add("menu-item");

        const details = document.createElement("div");

        const title = document.createElement("h3");
        title.textContent = item.name;

        const description = document.createElement("p");
        description.textContent = item.description;

        const price = document.createElement("span");
        price.classList.add("menu-price");
        price.textContent = item.price;

        details.appendChild(title);
        details.appendChild(description);

        menuItem.appendChild(details);
        menuItem.appendChild(price);

        menuItems.appendChild(menuItem);
    });
}

menuTabs.forEach(tab => {
    tab.addEventListener("click", function() {
        menuTabs.forEach(button => button.classList.remove("active"));

        this.classList.add("active");

        showMenu(this.dataset.category);
    });
});

showMenu("kava");


/* SUSTAV REZERVACIJA */


/* POVEZIVANJE SA SUPABASE BAZOM */

const SUPABASE_URL = "https://kwvazaymcblzxvydnwiq.supabase.co";
const SUPABASE_KEY = "sb_publishable_XtdQkGwKxr0ihLbAv2mmJw_n2_gqc6o";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


/* ELEMENTI STRANICE */

const dateInput = document.getElementById("reservationDate");
const availableTimes = document.getElementById("availableTimes");
const reservationForm = document.getElementById("reservationForm");
const selectedTimeText = document.getElementById("selectedTime");
const reservationMessage = document.getElementById("reservationMessage");

const times = [
    "08:00", "09:00", "10:00",
    "11:00", "12:00", "13:00",
    "14:00", "15:00", "16:00",
    "17:00", "18:00", "19:00",
    "20:00", "21:00"
];

let selectedTime = "";


/* TRENUTNI DATUM */

function getToday() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

dateInput.min = getToday();
dateInput.value = getToday();


/* PRIKAZ SLOBODNIH I ZAUZETIH TERMINA */

async function showTimes() {
    availableTimes.innerHTML = "Učitavanje termina...";
    selectedTime = "";
    selectedTimeText.textContent = "Niste odabrali termin.";
    reservationMessage.textContent = "";

    const selectedDate = dateInput.value;

    const { data, error } = await supabaseClient
        .from("booked_slots")
        .select("reservation_time")
        .eq("reservation_date", selectedDate);

    if (error) {
        availableTimes.textContent = "Greška pri učitavanju termina.";
        console.error(error);
        return;
    }

    availableTimes.innerHTML = "";

    const bookedTimes = data.map(item =>
        item.reservation_time.slice(0, 5)
    );

    times.forEach(time => {
        const button = document.createElement("button");

        button.type = "button";
        button.textContent = time;
        button.classList.add("time-slot");

        if (bookedTimes.includes(time)) {
            button.classList.add("booked");
            button.disabled = true;
        }

        button.addEventListener("click", function() {
            if (button.disabled) return;

            document.querySelectorAll(".time-slot").forEach(slot => {
                slot.classList.remove("selected");
            });

            button.classList.add("selected");
            selectedTime = time;

            selectedTimeText.textContent =
                "Odabrani termin: " + time;
        });

        availableTimes.appendChild(button);
    });
}


/* PROMJENA DATUMA */

dateInput.addEventListener("change", function() {
    if (dateInput.value < getToday()) {
        dateInput.value = getToday();
    }

    showTimes();
});


/* SLANJE REZERVACIJE U BAZU */

reservationForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    if (!selectedTime) {
        alert("Molimo odaberite slobodan termin.");
        return;
    }

    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const people = Number(document.getElementById("people").value);
    const note = document.getElementById("note").value.trim();

    if (!name || !phone || !people) {
        alert("Molimo ispunite sva obavezna polja.");
        return;
    }

    const submitButton = reservationForm.querySelector("button[type='submit']");

    submitButton.disabled = true;
    submitButton.textContent = "Rezervacija u tijeku...";

    const { data, error } = await supabaseClient.rpc("reserve_slot", {
        p_date: dateInput.value,
        p_time: selectedTime + ":00",
        p_name: name,
        p_phone: phone,
        p_people: people,
        p_note: note
    });

    submitButton.disabled = false;
    submitButton.textContent = "Potvrdi rezervaciju";

    if (error) {
        reservationMessage.textContent =
            "Došlo je do pogreške. Pokušajte ponovno.";

        console.error(error);
        return;
    }

    if (data === false) {
        reservationMessage.textContent =
            "Ovaj termin je upravo rezervirala druga osoba. Odaberite drugi termin.";

        await showTimes();
        return;
    }

    reservationMessage.textContent =
        `Uspješna rezervacija! ${name}, rezervirali ste termin ${dateInput.value} u ${selectedTime}.`;

    reservationForm.reset();

    await showTimes();
});


/* PRVO UČITAVANJE */

showTimes();



/* DOBIVANJE TRENUTNOG LOKALNOG DATUMA */

function getToday() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

dateInput.min = getToday();
dateInput.value = getToday();


/* DOHVAT REZERVACIJA */

function getReservations() {
    return JSON.parse(localStorage.getItem("reservations")) || {};
}


/* PRIKAZ SLOBODNIH TERMINA */

function showTimes() {
    availableTimes.innerHTML = "";
    selectedTime = "";

    selectedTimeText.textContent = "Niste odabrali termin.";
    reservationMessage.textContent = "";

    const reservations = getReservations();
    const selectedDate = dateInput.value;

    const bookedTimes = reservations[selectedDate] || [];

    times.forEach(time => {
        const button = document.createElement("button");

        button.type = "button";
        button.textContent = time;
        button.classList.add("time-slot");

        if (bookedTimes.includes(time)) {
            button.classList.add("booked");
            button.disabled = true;
        }

        button.addEventListener("click", function() {
            if (button.disabled) {
                return;
            }

            document.querySelectorAll(".time-slot").forEach(slot => {
                slot.classList.remove("selected");
            });

            button.classList.add("selected");

            selectedTime = time;

            selectedTimeText.textContent =
                "Odabrani termin: " + time;
        });

        availableTimes.appendChild(button);
    });
}


/* PROMJENA DATUMA */

dateInput.addEventListener("change", function() {
    if (dateInput.value < getToday()) {
        dateInput.value = getToday();
    }

    showTimes();
});


/* POTVRDA REZERVACIJE */

reservationForm.addEventListener("submit", function(event) {
    event.preventDefault();

    if (!selectedTime) {
        alert("Molimo odaberite slobodan termin.");
        return;
    }

    if (dateInput.value < getToday()) {
        alert("Nije moguće rezervirati termin u prošlosti.");
        return;
    }

    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const people = document.getElementById("people").value;
    const note = document.getElementById("note").value.trim();

    if (!name || !phone || !people) {
        alert("Molimo ispunite sva obavezna polja.");
        return;
    }

    const reservations = getReservations();
    const date = dateInput.value;

    if (!reservations[date]) {
        reservations[date] = [];
    }

    if (reservations[date].includes(selectedTime)) {
        alert("Ovaj termin je u međuvremenu rezerviran. Odaberite drugi termin.");
        showTimes();
        return;
    }

    reservations[date].push(selectedTime);

    localStorage.setItem("reservations", JSON.stringify(reservations));

    reservationMessage.textContent =
        `Uspješna rezervacija! ${name}, vaš termin je ${date} u ${selectedTime}. Broj osoba: ${people}.`;

    reservationForm.reset();

    showTimes();
});


/* PRVO UČITAVANJE TERMINA */

showTimes();
