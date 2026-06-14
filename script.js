
const cityList = document.getElementById('city-list');
const Api_key= '620598e9c40226e9b565a8339bb64af2';
const Weather_Api_key='c7200f4f7d0b49749f0131149261406'
const main_div=document.getElementById('main')
const search=document.getElementById('search-panel')
const welcome=document.getElementById('welcome-message')
const date=new Date()
let day=document.getElementById('date')
let temperature=document.getElementById('temperature')
const sunriseTime =document.getElementById('sunrise-time');
const sunsetTime =document.getElementById('sunset-time');
let min_temp=document.getElementById('min-temp-numeric')
let max_temp=document.getElementById('max-temp-numeric')
let real_feel=document.getElementById('real-feel-numeric')
let weather=document.getElementById('weather')
let speed=document.getElementById('speed')
let percentage=document.getElementById('percentage')
let icon=document.getElementById('icon-weather')
let place=document.getElementById('place-name')

day.textContent=date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
});

async function getWeather(city)
{
    try
        {
            temperature.textContent = "Loading...";
            const response=await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${Api_key}&units=metric`)
            const data= await response.json()
            const errorBox = document.getElementById('error');
            errorBox.style.display = 'none';
            if(data.cod == 200)
            {
                place.textContent= data.name;
                errorBox.style.display = 'none';
                
            }
            else
            {
                place.textContent=''
                errorBox.textContent = 'City not found';
                errorBox.style.display = 'block';
                setTimeout(() =>
                {
                    errorBox.style.display = 'none';
                },3000);

                return;
            }
            const timezoneOffset = data.timezone;

            const sunrise = new Date((data.sys.sunrise + timezoneOffset) * 1000);

            const sunset = new Date((data.sys.sunset + timezoneOffset) * 1000);
            sunriseTime.textContent =sunrise.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',timeZone:'UTC'});
            sunsetTime.textContent = sunset.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',timeZone:'UTC'});
            
            temperature.textContent=`${parseFloat((data.main.temp).toFixed(1))}\u00B0C`

            welcome.style.display='none'

            document.getElementById('leftpart-main-box').style.display='flex';
            document.getElementById('rightpart-main-box').style.display='flex';
            document.getElementById('sun-info').style.display='flex';

            real_feel.textContent=`${parseFloat((data.main.feels_like)).toFixed(1)}\u00B0C`
            weather.textContent=`${data.weather[0].main}`
            speed.textContent=`${((data.wind.speed)*3.6).toFixed(1)}Km/h`
            percentage.textContent=`${data.main.humidity}%`

            
            
            if(data.weather[0].icon.endsWith('d'))
            {
                setBackground_day(data.weather[0].main)
            }
            else
            {
                setBackground_night(data.weather[0].main)
            }
            console.log(data)
        }
    catch(error)
        {
            document.getElementById('error').textContent=`${error}`
        }
}

search.addEventListener('keydown',async (event)=>
{
    if(event.key==='Enter')
    {
        
        let city=event.target.value.trim().toLowerCase();
        
        localStorage.setItem('city',city)
        
        getWeather(city);
        ForCast(city);
        getRainChance(city);
        search.value=''
    }
})
    

search.addEventListener('input', async (e) =>
{
    const query = e.target.value.trim();

    if(query.length < 2)
    {
        cityList.innerHTML = '';
        
        return;
    }

    try
    {
        const response = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${Api_key}`);

        const cities = await response.json();

        cityList.innerHTML = '';

        cities.forEach(city =>
        {
            const option = document.createElement('option');

            option.value =
            `${city.name}, ${city.country}`;

            cityList.appendChild(option);
        });
    }
    catch(error)
    {
        alert(error);
    }
});


//ForCast

const iconMap = {
    "01d":"./icons/clear-icon.png",
    "01n":"./icons/night-clear.png",

    "02d":"./icons/cloudy-icon.png",
    "02n":"./icons/night-cloudy-icon.png",

    "03d":"./icons/cloudy-icon.png",
    "03n":"./icons/night-cloudy-icon.png",

    "04d":"./icons/cloudy-icon.png",
    "04n":"./icons/night-cloudy-icon.png",

    "09d":"./icons/rainy-icon.png",
    "09n":"./icons/night-rainy-icon.png",

    "10d":"./icons/rainy-icon.png",
    "10n":"./icons/night-rainy-icon.png",

    "11d":"./icons/thunderstorm.png",
    "11n":"./icons/night-thunderstorm-icon.png",

    "13d":"./icons/snow-icon.png",
    "13n":"./icons/night-snow-icon.png",

    "50d":"./icons/mist-icon.png",
    "50n":"./icons/mist-icon.png"
};


async function ForCast(city)
{
    try
    {
        const forCast_response=await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${Api_key}&units=metric`)
        const forCast_data=await forCast_response.json()
        
        const day_container=document.getElementById('days-name')
        const temp_container = document.getElementById('temperature-on-day');
        const icon_container = document.getElementById('weather-icon');

        icon_container.innerHTML='';
        temp_container.innerHTML = '';
        day_container.innerHTML=''


        const dailyForecast = forCast_data.list.filter(item =>
            item.dt_txt.includes("12:00:00")
        );
        dailyForecast.forEach(day =>
        {
            const span=document.createElement('span')

            span.textContent=new Date(day.dt_txt)
                .toLocaleDateString('en-US', {
                    weekday: 'long'
                });




            day_container.appendChild(span);
            const tempSpan = document.createElement('span');

            tempSpan.textContent = `${Math.round(day.main.temp)}°C`;

            temp_container.appendChild(tempSpan);

            const weatherIcon=document.createElement('img');

            weatherIcon.src=`https://openweathermap.org/img/wn/${day.weather[0].icon}@4x.png`;

            icon_container.appendChild(weatherIcon);
            
            
        })

        const next24Hours = forCast_data.list.slice(0,8);

        const temperatures = next24Hours.map(item => item.main.temp);

        const minTemperature = Math.min(...temperatures);

        const maxTemperature = Math.max(...temperatures);

        min_temp.textContent = `${minTemperature.toFixed(1)}°C`;

        max_temp.textContent = `${maxTemperature.toFixed(1)}°C`;
            
        

        const hourlyContainer = document.getElementById('hourly-container');
        hourlyContainer.innerHTML='';
        

        // Hour card loop
        
        forCast_data.list.slice(0,8).forEach(item =>
        {
            const card = document.createElement('div');
            card.classList.add('hour-card');
            const localTime = new Date((item.dt + forCast_data.city.timezone) * 1000);

            const hour = localTime.toLocaleTimeString('en-US',
                {
                    hour:'numeric',
                    minute:'2-digit',
                    hour12:true,
                    timeZone:'UTC'
                });

            card.innerHTML = `<p>${hour}</p>
                              <img src="${iconMap[item.weather[0].icon]}">
                              <p>${Math.round(item.main.temp)}°C</p>`;

            hourlyContainer.appendChild(card);
        });
        
    }

    
    catch(error)
    {
        document.getElementById('error').textContent=`City not found`
    }
}

const savedcity=localStorage.getItem('city')
if(savedcity)
{
    getWeather(savedcity);
    ForCast(savedcity);
    getRainChance(savedcity)
    place.textContent=savedcity;
}

async function getRainChance(city)
{
    try
    {
        const response = await fetch(
            `https://api.weatherapi.com/v1/forecast.json?key=${Weather_Api_key}&q=${city}&days=1`
        );

        const data = await response.json();

        const rain_chance =
        document.getElementById('rain-percentage');

        rain_chance.textContent =
        `${data.forecast.forecastday[0].day.daily_chance_of_rain}%`;
    }
    catch(error)
    {
        document.getElementById('error').textContent=`City not found`
    }
}




//Images itegration

function setBackground_day(condition)
{
    const backgroundImage=document.getElementById('centrepart-main-box')

    backgroundImage.classList=''

    icon.classList=''

    if(condition==='Clear')
    {
        backgroundImage.classList.add('clear')
        main_div.style.background =
        "linear-gradient(180deg, #4facfe 0%, #00f2fe 100%)";
        
        document.body.style.background =
        "linear-gradient(180deg,#87CEEB,#FFD54F)"
        document.body.style.color='white'
        icon.classList.add('clear-icon')
        
    }
    
    else if(condition==='Rain')
    {  
        backgroundImage.classList.add('rainy')
        
        main_div.style.background =
        "linear-gradient(180deg, #667DB6 0%, #485563 100%)";

        document.body.style.background =
            "linear-gradient(180deg, #5D7285 0%, #2C3E50 100%)";

        document.body.style.color = "white";
        icon.classList.add('rainy-icon')
    }

    else if(condition==='Clouds')
    {  
        backgroundImage.classList.add('clouds')
        
        main_div.style.background =
        "linear-gradient(180deg, #BDC3C7 0%, #2C3E50 100%)";

        document.body.style.background =
            "linear-gradient(180deg, #D7DDE8 0%, #757F9A 100%)";

        document.body.style.color = "white";
        icon.classList.add('clouds-icon')
    }
    else if(condition==='Snow')
    {
        backgroundImage.classList.add('snow')

        icon.classList.add('snow-icon')

        main_div.style.background =
        "linear-gradient(180deg, #E6F3FF 0%, #B8D8F8 100%)";
        document.body.style.background =
        "linear-gradient(180deg, #DDEEFF 0%, #A7C7E7 100%)";
        document.body.style.color = "#1F3A5F";

    }
    else if(condition==='Mist')
    {
        backgroundImage.classList.add('mist')
        icon.classList.add('mist-icon')

        main_div.style.background =
        "linear-gradient(180deg, #BFC9CA 0%, #85929E 100%)";

        document.body.style.background =
        "linear-gradient(180deg, #D5D8DC 0%, #AEB6BF 100%)";

        document.body.style.color = "#2C3E50";
    }
    else if(condition==='Fog')
    {
        backgroundImage.classList.add('fog')
        icon.classList.add('fog-icon')

        backgroundImage.classList.add('fog');

        main_div.style.background =
        "linear-gradient(180deg, #C7D0D8 0%, #8F9CA8 100%)";

        document.body.style.background =
        "linear-gradient(180deg, #E5E9EC 0%, #B7C0C8 100%)";

        document.body.style.color = "#2C3E50";
    }
    else if(condition==='Thunderstorm')
    {
        backgroundImage.classList.add('thunderstorm')
        icon.classList.add('thunderstorm-icon')
        main_div.style.background =
        "linear-gradient(180deg, #434343 0%, #000000 100%)";

        document.body.style.background =
        "linear-gradient(180deg, #232526 0%, #414345 100%)";

        document.body.style.color = "white";
    }
    else if(condition==='Tornado')
    {
        backgroundImage.classList.add('tornado')
        icon.classList.add('tornado-icon')

        main_div.style.background =
        "linear-gradient(180deg, #5D6D7E 0%, #212F3D 100%)";

        document.body.style.background =
        "linear-gradient(180deg, #85929E 0%, #2C3E50 100%)";

        document.body.style.color = "white";
    }
    else
    {
        backgroundImage.classList.add('default')
        icon.classList.add('default-icon')
        main_div.style.background =
        "linear-gradient(180deg, #90A4AE 0%, #546E7A 100%)";

        document.body.style.background =
        "linear-gradient(180deg, #CFD8DC 0%, #90A4AE 100%)";

        document.body.style.color = "#263238";
    }
}

function setBackground_night(condition)
{
    const backgroundImage=document.getElementById('centrepart-main-box')

    backgroundImage.classList =' '

    icon.classList =' '


    if(condition==='Clear')
    {
        backgroundImage.classList.add('night-clear')
        main_div.style.background =
        "linear-gradient(180deg, #1E3C72 0%, #2A5298 100%)";

        document.body.style.background =
        "linear-gradient(180deg, #0F2027 0%, #203A43 50%, #2C5364 100%)";
        document.body.style.color='white'
        icon.classList.add('night-clear-icon')
        
    }
    
    else if(condition==='Rain')
    {  
        backgroundImage.classList.add('night-rainy')
        
        main_div.style.background =
        "linear-gradient(180deg, #34495E 0%, #2C3E50 100%)";

        document.body.style.background =
        "linear-gradient(180deg, #141E30 0%, #243B55 100%)";

        document.body.style.color = "white";
        icon.classList.add('night-rainy-icon')
    }

    else if(condition==='Clouds')
    {  
        backgroundImage.classList.add('night-clouds')
        
        main_div.style.background =
        "linear-gradient(180deg, #4B6584 0%, #2C3E50 100%)";

        document.body.style.background =
        "linear-gradient(180deg, #232526 0%, #414345 100%)";

        document.body.style.color = "white";
        icon.classList.add('night-clouds-icon')
    }
    else if(condition==='Snow')
    {
        backgroundImage.classList.add('night-snow')

        icon.classList.add('night-snow-icon')

        main_div.style.background =
        "linear-gradient(180deg, #4B79A1 0%, #283E51 100%)";

        document.body.style.background =
        "linear-gradient(180deg, #141E30 0%, #243B55 100%)";
        document.body.style.color = "white";

    }
    else if(condition==='Mist')
    {
        backgroundImage.classList.add('night-mist')
        icon.classList.add('night-mist-icon')

        main_div.style.background =
        "linear-gradient(180deg, #5D6D7E 0%, #34495E 100%)";

        document.body.style.background =
        "linear-gradient(180deg, #2C3E50 0%, #4CA1AF 100%)";

        document.body.style.color = "white";
    }
    else if(condition==='Fog')
    {
        backgroundImage.classList.add('night-fog')
        icon.classList.add('night-fog-icon')


        main_div.style.background =
        "linear-gradient(180deg, #6C7A89 0%, #3A4A5A 100%)";

        document.body.style.background =
        "linear-gradient(180deg, #232526 0%, #485563 100%)";

        document.body.style.color = "white";
    }
    else if(condition==='Thunderstorm')
    {
        backgroundImage.classList.add('night-thunderstorm')
        icon.classList.add('night-thunderstorm-icon')
        main_div.style.background =
        "linear-gradient(180deg, #2C3E50 0%, #000000 100%)";

        document.body.style.background =
        "linear-gradient(180deg, #0F0C29 0%, #302B63 50%, #24243E 100%)";

        document.body.style.color = "white";
    }
    else if(condition==='Tornado')
    {
        backgroundImage.classList.add('night-tornado')
        icon.classList.add('night-tornado-icon')

       main_div.style.background =
        "linear-gradient(180deg, #434343 0%, #000000 100%)";

        document.body.style.background =
        "linear-gradient(180deg, #232526 0%, #0F0F0F 100%)";

        document.body.style.color = "white";
    }
    else
    {
        backgroundImage.classList.add('default')
        icon.classList.add('default-icon')
        main_div.style.background =
        "linear-gradient(180deg, #455A64 0%, #263238 100%)";

        document.body.style.background =
        "linear-gradient(180deg, #1C1C1C 0%, #2C3E50 100%)";

        document.body.style.color = "white";
    }
}



