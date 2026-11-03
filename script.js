// Поездки из localStorage, если ещё нет, создаём пустой массив
let trips = JSON.parse(localStorage.getItem("trips")) || [];

// Массив для хранения фотографий новой поездки
let currentPhotos = [];


// Находим поля для ввода дат
let dateInputs = document.querySelectorAll(".date-input");

// Добавляем обработчик ввода для каждого поля
dateInputs.forEach(function(input) {

    input.addEventListener("input", function() {

        // Удаляем все символы, кроме цифр
        let value = input.value.replace(/\D/g, "");

        // Ограничение
        if (value.length > 8) {
            value = value.substring(0, 8);
        }

        // Точки между днём, месяцем и годом
        if (value.length > 4) {
            value =
                value.substring(0, 2) + "." +
                value.substring(2, 4) + "." +
                value.substring(4);
        }
        else if (value.length > 2) {
            value =
                value.substring(0, 2) + "." +
                value.substring(2);
        }

        input.value = value;

        // Перемещаем курсор после автоматически добавленной точки
        if (value.length == 2 || value.length == 5) {
            input.setSelectionRange(
                value.length + 1,
                value.length + 1
            );
        }

        // Сохранение
        saveDraft();
    });

});


// Из ДД.ММ.ГГГГ в Date, если дата неправильная, возвращаем null
function getDate(value) {

    let parts = value.split(".");

    if (parts.length != 3) {
        return null;
    }

    let day = Number(parts[0]);
    let month = Number(parts[1]);
    let year = Number(parts[2]);

    let date = new Date(year, month - 1, day);

    // Проверка, что введённая дата действительно существует
    if (
        date.getFullYear() != year ||
        date.getMonth() != month - 1 ||
        date.getDate() != day
    ) {
        return null;
    }

    return date;
}


// Расчет продолжительности поездки
function getDuration(start, end) {

    let firstDate = getDate(start);
    let secondDate = getDate(end);

    if (!firstDate || !secondDate) {
        return 0;
    }

    let difference = secondDate - firstDate;

    return Math.floor(difference / 86400000) + 1;
}


// ДДобавление фотографий
document.getElementById("addPhoto").addEventListener("click", function() {

    let input = document.getElementById("photoUrl");
    let url = input.value.trim();
    let error = document.getElementById("error");

    if (url == "") {
        error.textContent = "Введите ссылку на фотографию.";
        return;
    }

    currentPhotos.push(url);

    input.value = "";

    error.textContent = "";

    showPhotoPreview();

    saveDraft();
});


// Предварительный просмотр фотографий
function showPhotoPreview() {

    let preview = document.getElementById("photoPreview");

    preview.innerHTML = "";

    // Перебираем все добавленные фотографии
    for (let i = 0; i < currentPhotos.length; i++) {

        let item = document.createElement("div");
        item.className = "preview-item";

        // Создаём изображение и указываем его адрес
        let image = document.createElement("img");
        image.src = currentPhotos[i];

        // Кнопка для удаления фотографии
        let button = document.createElement("button");

        button.className = "remove-photo";
        button.textContent = "×";

        button.addEventListener("click", function() {

            // Удаляем фотографию из массива
            currentPhotos.splice(i, 1);

            // Обновляем список фотографий
            showPhotoPreview();

            saveDraft();
        });

        item.appendChild(image);
        item.appendChild(button);

        preview.appendChild(item);
    }
}

// Сохраняем введённые данные в sessionStorage, черновик сохраняется до закрытия вкладки браузера
function saveDraft() {

    let draft = {
        country: document.getElementById("country").value,
        city: document.getElementById("city").value,
        startDate: document.getElementById("startDate").value,
        endDate: document.getElementById("endDate").value,
        impressions: document.getElementById("impressions").value,
        photos: currentPhotos
    };

    sessionStorage.setItem(
        "tripDraft",
        JSON.stringify(draft)
    );
}

// Восстанавление данных из sessionStorage
function loadDraft() {

    let savedDraft = sessionStorage.getItem("tripDraft");

    // Если черновика нет, ничего не делаем
    if (!savedDraft) {
        return;
    }

    let draft = JSON.parse(savedDraft);

    // Заполняем поля формы сохранёнными значениями
    document.getElementById("country").value =
        draft.country || "";

    document.getElementById("city").value =
        draft.city || "";

    document.getElementById("startDate").value =
        draft.startDate || "";

    document.getElementById("endDate").value =
        draft.endDate || "";

    document.getElementById("impressions").value =
        draft.impressions || "";

    // Восстанавливаем фотографии.
    currentPhotos = draft.photos || [];

    showPhotoPreview();
}


// Сохранение ввода в черновик

document.getElementById("country")
    .addEventListener("input", saveDraft);

document.getElementById("city")
    .addEventListener("input", saveDraft);

document.getElementById("impressions")
    .addEventListener("input", saveDraft);


// Добавление новой поездки
// Обработка отправки формы
document.getElementById("tripForm").addEventListener(
    "submit",
    function(event) {

        // Отмена стандартной отправки формы
        event.preventDefault();

        // Получаем значения из полей формы
        let country =
            document.getElementById("country").value.trim();

        let city =
            document.getElementById("city").value.trim();

        let startDate =
            document.getElementById("startDate").value;

        let endDate =
            document.getElementById("endDate").value;

        let impressions =
            document.getElementById("impressions").value.trim();

        let error =
            document.getElementById("error");


        // Проверка названия страны и города
        let namePattern =
            /^[А-Яа-яA-Za-zЁё\s-]{2,50}$/;


        if (!namePattern.test(country)) {

            error.textContent =
                "Введите правильное название страны.";

            return;
        }


        if (!namePattern.test(city)) {

            error.textContent =
                "Введите правильное название города.";

            return;
        }


        // Проверка правильности дат
        let firstDate = getDate(startDate);
        let secondDate = getDate(endDate);


        if (!firstDate || !secondDate) {

            error.textContent =
                "Введите даты в формате ДД.ММ.ГГГГ.";

            return;
        }


        // Дата начала не позже даты окончания
        if (firstDate > secondDate) {

            error.textContent =
                "Дата начала не может быть позже даты окончания.";

            return;
        }


        // Создаём объект с информацией о поездке
        let trip = {

            id: Date.now(),

            country: country,

            city: city,

            startDate: startDate,

            endDate: endDate,

            photos: currentPhotos.slice(),

            impressions: impressions
        };


        // Добавляем новую поездку в общий массив
        trips.push(trip);


        // Сохраняем обновлённый массив в localStorage
        localStorage.setItem(
            "trips",
            JSON.stringify(trips)
        );


        // Очищаем форму после добавления поездки
        document.getElementById("tripForm").reset();

        currentPhotos = [];

        // Удаляем сохранённый черновик
        sessionStorage.removeItem("tripDraft");

        showPhotoPreview();

        // Обновляем список поездок и статистику
        showTrips();

        showStatistics();

        error.textContent = "";
    }
);


// Карточки для всех сохранённых поездок
function showTrips() {

    let container =
        document.getElementById("trips");

    container.innerHTML = "";


    if (trips.length == 0) {

        let text = document.createElement("p");

        text.className = "empty-text";

        text.textContent =
            "Пока нет добавленных поездок.";

        container.appendChild(text);

        return;
    }


    // Перебираем все поездки
    for (let i = 0; i < trips.length; i++) {

        let trip = trips[i];

        // Проверяем наличие массива фотографий
        if (!trip.photos) {
            trip.photos = [];
        }


        // Создаём карточку поездки
        let card =
            document.createElement("div");

        card.className = "trip-card";


        let image =
            document.createElement("img");


        if (trip.photos.length > 0) {

            image.src =
                trip.photos[0];

        }
        else {

            image.src =
                "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b";
        }


        // Блок с информацией о поездке
        let info =
            document.createElement("div");

        info.className = "trip-info";


        // Название страны и города
        let title =
            document.createElement("h3");

        title.textContent =
            trip.country + ", " + trip.city;


        // Даты поездки
        let dates =
            document.createElement("p");

        dates.textContent =
            trip.startDate + " - " + trip.endDate;


        // Продолжительность поездки
        let duration =
            document.createElement("p");

        duration.textContent =
            "Продолжительность: " +
            getDuration(
                trip.startDate,
                trip.endDate
            ) +
            " дн.";


        // Кнопка для просмотра подробной информации
        let detailsButton =
            document.createElement("button");

        detailsButton.className =
            "trip-button";

        detailsButton.textContent =
            "Подробнее";


        detailsButton.addEventListener(
            "click",
            function() {

                showTrip(trip);
            }
        );


        // Кнопка удаления поездки
        let deleteButton =
            document.createElement("button");

        deleteButton.className =
            "trip-button delete-button";

        deleteButton.textContent =
            "Удалить";


        deleteButton.addEventListener(
            "click",
            function() {

                // Удаляем выбранную поездку из массива
                trips.splice(i, 1);

                // Сохраняем изменения
                localStorage.setItem(
                    "trips",
                    JSON.stringify(trips)
                );

                // Обновляем список и статистику
                showTrips();

                showStatistics();
            }
        );


        // Добавление элементов в блок информации
        info.appendChild(title);

        info.appendChild(dates);

        info.appendChild(duration);

        info.appendChild(detailsButton);

        info.appendChild(deleteButton);


        // Карточка поездки
        card.appendChild(image);

        card.appendChild(info);


        container.appendChild(card);
    }
}


// Подробная информация
function showTrip(trip) {

    let container =
        document.getElementById("tripDetails");

    container.innerHTML = "";


    if (!trip.photos) {
        trip.photos = [];
    }


    // Основной блок 
    let details =
        document.createElement("div");

    details.className =
        "trip-details";


    let info =
        document.createElement("div");

    info.className =
        "details-info";


    let title =
        document.createElement("h3");

    title.textContent =
        trip.country + ", " + trip.city;


    let dates =
        document.createElement("p");

    dates.textContent =
        "Даты поездки: " +
        trip.startDate +
        " - " +
        trip.endDate;


    let duration =
        document.createElement("p");

    duration.textContent =
        "Продолжительность: " +
        getDuration(
            trip.startDate,
            trip.endDate
        ) +
        " дней";


    let impressions =
        document.createElement("p");

    impressions.textContent =
        "Впечатление: " +
        (trip.impressions || "не добавлено");


    info.appendChild(title);

    info.appendChild(dates);

    info.appendChild(duration);

    info.appendChild(impressions);


    let gallery =
        document.createElement("div");

    gallery.className =
        "details-gallery";


    if (trip.photos.length == 0) {

        let noPhoto =
            document.createElement("div");

        noPhoto.className =
            "no-photo";

        noPhoto.textContent =
            "Фотографии не добавлены.";

        gallery.appendChild(noPhoto);

    }
    else {

        for (
            let i = 0;
            i < trip.photos.length;
            i++
        ) {

            let image =
                document.createElement("img");

            image.src =
                trip.photos[i];

            gallery.appendChild(image);
        }
    }


    details.appendChild(info);

    details.appendChild(gallery);

    container.appendChild(details);


    let mapTitle =
        document.createElement("h4");

    mapTitle.className =
        "map-title";

    mapTitle.textContent =
        "Место поездки";


    let map =
        document.createElement("div");

    map.className =
        "map-container";


    // Встраиваем карту OpenStreetMap
    let iframe =
        document.createElement("iframe");

    iframe.src =
        "https://www.openstreetmap.org/export/embed.html";

    iframe.loading = "lazy";


    map.appendChild(iframe);


    let mapNote =
        document.createElement("p");

    mapNote.className =
        "map-note";

    mapNote.textContent =
        "Место поездки: " +
        trip.city +
        ", " +
        trip.country;


    container.appendChild(mapTitle);

    container.appendChild(map);

    container.appendChild(mapNote);
}


// Статистика
// Подсчитываем количество поездок, стран, городов и фотографий
function showStatistics() {

    let countries = [];

    let cities = [];

    let photoCount = 0;


    for (let i = 0; i < trips.length; i++) {

        let trip = trips[i];


        if (!trip.photos) {
            trip.photos = [];
        }


        if (!countries.includes(trip.country)) {

            countries.push(trip.country);
        }


        let city =
            trip.country + ", " + trip.city;


        if (!cities.includes(city)) {

            cities.push(city);
        }


        photoCount =
            photoCount + trip.photos.length;
    }


    document.getElementById("tripCount")
        .textContent = trips.length;

    document.getElementById("countryCount")
        .textContent = countries.length;

    document.getElementById("cityCount")
        .textContent = cities.length;

    document.getElementById("photoCount")
        .textContent = photoCount;


    let list =
        document.getElementById("countriesList");

    list.innerHTML = "";


    for (let i = 0; i < countries.length; i++) {

        let countryName =
            countries[i];


        let country =
            document.createElement("div");

        country.className =
            "country";


        let button =
            document.createElement("button");

        button.className =
            "country-button";

        button.textContent =
            countryName;


        let cityList =
            document.createElement("div");

        cityList.className =
            "city-list";


        for (let j = 0; j < trips.length; j++) {

            if (trips[j].country == countryName) {

                let city =
                    document.createElement("p");

                city.textContent =
                    trips[j].city;

                cityList.appendChild(city);
            }
        }


        button.addEventListener(
            "click",
            function() {

                cityList.classList.toggle("show");
            }
        );


        country.appendChild(button);

        country.appendChild(cityList);

        list.appendChild(country);
    }
}



// При открытии страницы восстанавливаем черновик
loadDraft();

showTrips();

showStatistics();