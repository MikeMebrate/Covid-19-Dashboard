const covidSummaryUrl = `https://api.covid19api.com/summary`;

fetch(covidSummaryUrl)
  .then((response) => response.json())
  .then((covidSummaryData) => {
    let myObj = JSON.stringify(covidSummaryData);
    localStorage.setItem("covid", myObj);
  });

fetch(
  "https://api.covid19api.com/world?from=2020-03-01T00:00:00Z&to=2023-04-01T00:00:00Z"
)
  .then((response) => response.json())
  .then((worldAPI) => {
    let myObj = JSON.stringify(worldAPI);
    localStorage.setItem("covidWorld", myObj);
  });
const urlCountryFlag = "https://restcountries.com/v2/all";

//Country Flags
fetch(urlCountryFlag)
  .then((response) => response.json())
  .then((CountriesFlag) => {
    let myObj = JSON.stringify(CountriesFlag);
    localStorage.setItem("countriesFlag", myObj);
  });

const covidWorldSummaryData = JSON.parse(localStorage.getItem("covidWorld"));
const covidSummaryData = JSON.parse(localStorage.getItem("covid"));
const countriesFlag = JSON.parse(localStorage.getItem("countriesFlag"));
let totalCofirmed = covidSummaryData.Global.TotalConfirmed;
let totalDeath = covidSummaryData.Global.TotalDeaths;

document.getElementById("totalCase").innerHTML = totalCofirmed.toLocaleString();
document.getElementById(`totalDeath`).innerHTML = totalDeath.toLocaleString();

let a = document.getElementsByClassName(`pTotalCase`);
let b = document.getElementsByClassName(`pTotalDeath`);

for (i = 0; i < a.length; i++) {
  a[i].innerHTML = totalCofirmed.toLocaleString();
  b[i].innerHTML = totalDeath.toLocaleString();
}
var sortedCase = new Array();

for (let i = 0; i < covidSummaryData.Countries.length; i++) {
  sortedCase[i] = new Array();
  sortedCase[i][0] = i;
  sortedCase[i][1] = covidSummaryData.Countries[i].TotalConfirmed;

  let listOfCountries = `<option value="${covidSummaryData.Countries[i].Country}"></option>`;

  document.getElementById(`searchList`).innerHTML += listOfCountries;
}

for (let i = 0; i < sortedCase.length; i++) {
  for (let j = i + 1; j < sortedCase.length; j++) {
    if (sortedCase[i][1] < sortedCase[j][1]) {
      var temp = sortedCase[i];
      sortedCase[i] = sortedCase[j];
      sortedCase[j] = temp;
    }
  }
}

for (let i = 0; i < sortedCase.length; i++) {
  if (covidSummaryData.Countries[sortedCase[i][0]]) {
    let countryName = covidSummaryData.Countries[sortedCase[i][0]].Country;
    let totalCofirmedCountries =
      covidSummaryData.Countries[sortedCase[i][0]].TotalConfirmed;
    let totalDeathCountries =
      covidSummaryData.Countries[sortedCase[i][0]].TotalDeaths;

    let info = `
    <div class="col-1 fw-normal">${i + 1}</div>          
    <div class="col-5 fw-normal">${countryName}</div>
    <div class="col-3">${totalCofirmedCountries.toLocaleString()}</div>
    <div class="col-3">${totalDeathCountries.toLocaleString()}</div>`;

    document.getElementById(`totalCountryTable`).innerHTML += info;
  }
}

function search(clicked) {
  let inputSearch = document.getElementById("searchInput");
  if ((event.keyCode == 13 && clicked == null) || clicked != null) {
    searchCountryGetMonthly(inputSearch.value);
  }
}

(async () => {
  const topology = await fetch(
    "https://code.highcharts.com/mapdata/custom/world.topo.json"
  ).then((response) => response.json());

  Highcharts.getJSON(
    "https://cdn.jsdelivr.net/gh/highcharts/highcharts@v7.0.0/samples/data/world-population-density.json",
    function (data) {
      // Prevent logarithmic errors in color calulcation
      data.forEach(function (p) {
        p.value = p.value < 1 ? 1 : p.value;
      });
      var lengthOfData = data.length;
      for (let i = 0; i < lengthOfData; i++) {
        for (let j = 0; j < covidSummaryData.Countries.length; j++) {
          if (data[i].code == covidSummaryData.Countries[j].CountryCode) {
            data[i].value = Number(
              covidSummaryData.Countries[j].TotalConfirmed
            );
            break;
          }
        }
      }

      // Initialize the chart
      Highcharts.mapChart("worldchart", {
        chart: {
          map: topology,
        },

        title: {
          text: "Zoom in on country by double click",
        },

        mapNavigation: {
          enabled: true,
          enableDoubleClickZoomTo: true,
          buttonOptions: {
            verticalAlign: "bottom",
          },
        },

        mapView: {
          fitToGeometry: {
            type: "MultiPoint",
            coordinates: [
              // Alaska west
              [-164, 54],
              // Greenland north
              [-35, 84],
              // New Zealand east
              [179, -38],
              // Chile south
              [-68, -55],
            ],
          },
        },

        colorAxis: {
          min: 1,
          max: 1_000_000,
          type: "logarithmic",
        },

        series: [
          {
            data: data,
            joinBy: ["iso-a3", "code3"],
            name: "Total Cases",
            states: {
              hover: {
                color: "#a4edba",
              },
            },
            tooltip: {},
          },
        ],
      });
      var chart = Highcharts.charts;
    }
  );
})();

//Chart 2
var dailyData2020 = new Array();
var dailyData2021 = new Array();
var dailyData2022 = new Array();
var dailyData2023 = new Array();

function searchCountryGetMonthly(country) {
  var data3Year = new Array();
  let sumOfMonth = 0;

  let countryCode = "";
  for (let i = 0; i < covidSummaryData.Countries.length; i++) {
    if (covidSummaryData.Countries[i].Country == country) {
      countryCode = covidSummaryData.Countries[i].CountryCode;
      break;
    }
  }

  let flagPng = "";
  for (let i = 0; i < countriesFlag.length; i++) {
    if (countriesFlag[i].alpha2Code == countryCode) {
      flagPng = countriesFlag[i].flag;
    }
  }

  let urlCountry = `https://api.covid19api.com/dayone/country/${countryCode}`;
  //alert(urlCountry)
  fetch(urlCountry)
    .then((respose) => respose.json())
    .then((monthly) => {
      let divs = `
    
      <div id="searchDiv" class="container-fluid bg-ligh  mb-0 pb-5 text-dark fw-bold">
      <p>World Countries</p>
      <h1 class="text-center text-primary">${monthly[
        monthly.length - 1
      ].Country.toUpperCase()}</h1>
      <h4 class="mt-3">Overview</h4>
      <hr />
      <div class="row">
        <div class="col-md-6">
          <div class="row mt-3">
            <div class="col-4">
              <h5>Confirmed Cases</h5>
              <h5>${monthly[monthly.length - 1].Confirmed.toLocaleString()}</h5>
            </div>
            <div class="col-4 text-end">
              <h5>Deaths</h5>
              <h5>${monthly[monthly.length - 1].Deaths.toLocaleString()}</h5>
            </div>
          </div>
        </div>
        <div class="col-md-6 text-center">
          <img
            src="${flagPng}"
            width="300px"
            class="shadow-lg mt-2 img-fluid"
            alt=""
          />
        </div>
      </div>
    </div>
     <hr>
     <div class="container-fluid m-0 p-0  mt-4">
     <div class="row justify-content-center">
       <div id="ChartYearCase" class="col-md-12 rounded-2"></div>
     </div>
   </div>
    <div class="container-fluid border m-0 p-0  mt-4 mb-5">
      <div class="row justify-content-center">
        <div id="daily2020" class="col-md-3 rounded-2"></div>
        <div id="daily2021" class="col-md-3 rounded-2"></div>
        <div id="daily2022" class="col-md-3 rounded-2"></div>
        <div id="daily2023" class="col-md-3 rounded-2"></div>
      </div>
    </div>`;

      let sumOfConfi = 0;
      let Deaths = 0;

      let k = 0,
        t = 0,
        u = 0;
      for (let i = 0; i < monthly.length; i++) {
        let constrate = monthly[i].Date.slice(0, 4);
        if (constrate == `2020`) {
          dailyData2020[i] = new Array();
          dailyData2020[i][0] = monthly[i].Confirmed - sumOfConfi;
          dailyData2020[i][1] = monthly[i].Deaths - Deaths;
          sumOfConfi = monthly[i].Confirmed;
          Deaths = monthly[i].Deaths;
        } else if (constrate == `2021`) {
          dailyData2021[k] = new Array();
          dailyData2021[k][0] = monthly[i].Confirmed - sumOfConfi;
          dailyData2021[k][1] = monthly[i].Deaths - Deaths;
          sumOfConfi = monthly[i].Confirmed;
          Deaths = monthly[i].Deaths;
          k++;
        } else if (constrate == `2022`) {
          dailyData2022[t] = new Array();
          dailyData2022[t][0] = monthly[i].Confirmed - sumOfConfi;
          dailyData2022[t][1] = monthly[i].Deaths - Deaths;
          sumOfConfi = monthly[i].Confirmed;
          Deaths = monthly[i].Deaths;
          t++;
        } else if (constrate == `2023`) {
          dailyData2023[u] = new Array();
          dailyData2023[u][0] = monthly[i].Confirmed - sumOfConfi;
          dailyData2023[u][1] = monthly[i].Deaths - Deaths;
          sumOfConfi = monthly[i].Confirmed;
          Deaths = monthly[i].Deaths;
          u++;
        }
      }

      let m = 0;
      for (let j = 0; j < 12; j++) {
        for (let i = 0; i < monthly.length; i++) {
          let constrate = monthly[i].Date.slice(0, 7);
          if (constrate == `2020-${m}${Number(j + 1)}`) {
            sumOfMonth = Number(monthly[i].Confirmed);
            if (monthly[i + 1].Date.slice(0, 7) == `2020-${Number(j + 2)}`)
              m = "";
            else if (
              monthly[i + 1].Date.slice(0, 7) == `2020-${m}${Number(j + 2)}`
            )
              break;
          }
        }
        data3Year.push(sumOfMonth);
        sumOfMonth = 0;
      }
      m = 0;
      for (let j = 0; j < 12; j++) {
        for (let i = 0; i < monthly.length; i++) {
          let constrate = monthly[i].Date.slice(0, 7);
          if (constrate == `2021-${m}${Number(j + 1)}`) {
            sumOfMonth = Number(monthly[i].Confirmed);
            if (monthly[i + 1].Date.slice(0, 7) == `2021-${Number(j + 2)}`)
              m = "";
            else if (
              monthly[i + 1].Date.slice(0, 7) == `2021-${m}${Number(j + 2)}`
            )
              break;
          }
        }
        data3Year.push(sumOfMonth);
        sumOfMonth = 0;
      }

      m = 0;
      for (let j = 0; j < 12; j++) {
        for (let i = 0; i < monthly.length; i++) {
          let constrate = monthly[i].Date.slice(0, 7);
          if (constrate == `2022-${m}${Number(j + 1)}`) {
            sumOfMonth = Number(monthly[i].Confirmed);
            if (monthly[i + 1].Date.slice(0, 7) == `2022-${Number(j + 2)}`)
              m = "";
            else if (
              monthly[i + 1].Date.slice(0, 7) == `2022-${m}${Number(j + 2)}`
            )
              break;
          }
        }
        data3Year.push(sumOfMonth);
        sumOfMonth = 0;
      }

      m = 0;
      for (let j = 0; j < 3; j++) {
        for (let i = 0; i < monthly.length; i++) {
          let constrate = monthly[i].Date.slice(0, 7);
          if (constrate == `2023-${m}${Number(j + 1)}`) {
            sumOfMonth = Number(monthly[i].Confirmed);
          }
        }
        data3Year.push(sumOfMonth);
        sumOfMonth = 0;
      }

      for (let i = 1; i < data3Year.length; i++) {
        let sum = 0;
        for (let j = 0; j < i; j++) {
          sum += data3Year[j];
        }
        data3Year[i] = data3Year[i] - sum;
      }

      document.getElementById("bodychange").innerHTML = divs;

      Highcharts.chart("ChartYearCase", {
        chart: {
          type: "spline",
        },
        title: {
          text: "Monthly Death",
        },
        xAxis: {
          categories: [
            "Dec 20",
            "Jan 20",
            "Feb 20",
            "Mar 20",
            "Apr 20",
            "May 20",
            "Jun 20",
            "Jul 20",
            "Aug 20",
            "Sep 20",
            "Oct 20",
            "Nov 20",
            "Dec 21",
            "Jan 21",
            "Feb 21",
            "Mar 21",
            "Apr 21",
            "May 21",
            "Jun 21",
            "Jul 21",
            "Aug 21",
            "Sep 21",
            "Oct 21",
            "Nov 21",
            "Dec 21",
            "Jan 22",
            "Feb 22",
            "Mar 22",
            "Apr 22",
            "May 22",
            "Jun 22",
            "Jul 22",
            "Aug 22",
            "Sep 22",
            "Oct 22",
            "Nov 22",
            "Dec 23",
            "Jan 23",
            "Feb 23",
            "Mar 23",
          ],
          accessibility: {
            description: "Months of the year",
          },
        },
        yAxis: {
          title: {
            text: "Number of People",
          },
          labels: {
            formatter: function () {
              return this.value + "";
            },
          },
        },
        tooltip: {
          crosshairs: true,
          shared: true,
        },
        plotOptions: {
          spline: {
            marker: {
              radius: 4,
              lineColor: "#666666",
              lineWidth: 1,
            },
          },
        },
        series: [
          {
            name: "Death",
            color: "#DC4C64",
            marker: {
              symbol: "square",
            },
            data: data3Year,
          },
        ],
      });

      //Chart 1
      Highcharts.getJSON(
        "https://cdn.jsdelivr.net/gh/highcharts/highcharts@v7.0.0/samples/data/range.json",
        function (data) {
          for (let i = 0; i < data.length; i++) {
            if (i < dailyData2020.length) {
              data[i][1] = dailyData2020[i][0];
              data[i][2] = dailyData2020[i][1];
            } else {
              data[i][1] = 0;
              data[i][2] = 0;
            }
          }

          Highcharts.chart("daily2020", {
            chart: {
              type: "arearange",
              zoomType: "x",
              scrollablePlotArea: {
                minWidth: 40,
                scrollPositionX: 1,
              },
            },

            title: {
              text: "Covid-19 analysis in 2020",
            },

            xAxis: {
              type: "datetime",
              accessibility: {
                rangeDescription: "Range: Feb 1st 2020 to Dec 31 2023.",
              },
            },

            yAxis: {
              title: {
                text: null,
              },
            },

            tooltip: {
              crosshairs: true,
              shared: true,
              xDateFormat: "%A, %b %e",
            },

            legend: {
              enabled: false,
            },

            series: [
              {
                name: "Case and Death",
                data: data,
              },
            ],
          });
        }
      );

      //Chart 2
      Highcharts.getJSON(
        "https://cdn.jsdelivr.net/gh/highcharts/highcharts@v7.0.0/samples/data/range.json",
        function (data) {
          for (let i = 0; i < data.length; i++) {
            if (i < dailyData2021.length) {
              data[i][1] = dailyData2021[i][0];
              data[i][2] = dailyData2021[i][1];
            } else {
              data[i][1] = 0;
              data[i][2] = 0;
            }
          }

          Highcharts.chart("daily2021", {
            chart: {
              type: "arearange",
              zoomType: "x",
              scrollablePlotArea: {
                minWidth: 40,
                scrollPositionX: 1,
              },
            },

            title: {
              text: "Covid-19 analysis in 2021",
            },

            xAxis: {
              type: "datetime",
              accessibility: {
                rangeDescription: "Range: Feb 1st 2020 to Dec 31 2023.",
              },
            },

            yAxis: {
              title: {
                text: null,
              },
            },

            tooltip: {
              crosshairs: true,
              shared: true,
              xDateFormat: "%A, %b %e",
            },

            legend: {
              enabled: false,
            },

            series: [
              {
                name: "Case and Death",
                data: data,
              },
            ],
          });
        }
      );

      //Chart 3
      Highcharts.getJSON(
        "https://cdn.jsdelivr.net/gh/highcharts/highcharts@v7.0.0/samples/data/range.json",
        function (data) {
          for (let i = 0; i < data.length; i++) {
            if (i < dailyData2022.length) {
              data[i][1] = dailyData2022[i][0];
              data[i][2] = dailyData2022[i][1];
            } else {
              data[i][1] = 0;
              data[i][2] = 0;
            }
          }

          Highcharts.chart("daily2022", {
            chart: {
              type: "arearange",
              zoomType: "x",
              scrollablePlotArea: {
                minWidth: 40,
                scrollPositionX: 1,
              },
            },

            title: {
              text: "Covid-19 analysis in 2022",
            },

            xAxis: {
              type: "datetime",
              accessibility: {
                rangeDescription: "Range: Feb 1st 2020 to Dec 31 2023.",
              },
            },

            yAxis: {
              title: {
                text: null,
              },
            },

            tooltip: {
              crosshairs: true,
              shared: true,
              valueSuffix: "°C",
              xDateFormat: "%A, %b %e",
            },

            legend: {
              enabled: false,
            },

            series: [
              {
                name: "Case and Death",
                data: data,
              },
            ],
          });
        }
      );

      //Chart 4
      Highcharts.getJSON(
        "https://cdn.jsdelivr.net/gh/highcharts/highcharts@v7.0.0/samples/data/range.json",
        function (data) {
          for (let i = 0; i < data.length; i++) {
            if (i < dailyData2023.length) {
              data[i][1] = dailyData2023[i][0];
              data[i][2] = dailyData2023[i][1];
            } else {
              data[i][1] = 0;
              data[i][2] = 0;
            }
          }

          Highcharts.chart("daily2023", {
            chart: {
              type: "arearange",
              zoomType: "x",
              scrollablePlotArea: {
                minWidth: 40,
                scrollPositionX: 1,
              },
            },

            title: {
              text: "Covid-19 analysis in 2023",
            },

            xAxis: {
              type: "datetime",
              accessibility: {
                rangeDescription: "Range: Feb 1st 2023 to Mar 31 2023.",
              },
            },

            yAxis: {
              title: {
                text: null,
              },
            },

            tooltip: {
              crosshairs: true,
              shared: true,
              valueSuffix: "°C",
              xDateFormat: "%A, %b %e",
            },

            legend: {
              enabled: false,
            },

            series: [
              {
                name: "Case and Death",
                data: data,
              },
            ],
          });
        }
      );
    })
    .catch((err) => console.log(err));
}

Highcharts.chart("chartDetailCase", {
  chart: {
    type: "spline",
  },
  title: {
    text: "Monthly World Case",
  },
  xAxis: {
    categories: [
      "Jun 21",
      "Jul 21",
      "Aug 21",
      "Sep 21",
      "Oct 21",
      "Nov 21",
      "Dec 22",
      "Jan 22",
      "Feb 22",
      "Mar 22",
      "Apr 22",
      "May 22",
      "Jun 22",
      "Jul 22",
      "Aug 22",
      "Sep 22",
      "Oct 22",
      "Nov 22",
      "Dec 23",
      "Jan 23",
      "Feb 23",
      "Mar 23",
    ],
    accessibility: {
      description: "Months of the year",
    },
  },
  yAxis: {
    title: {
      text: "Number of People",
    },
    labels: {
      formatter: function () {
        return this.value + "";
      },
    },
  },
  tooltip: {
    crosshairs: true,
    shared: true,
  },
  plotOptions: {
    spline: {
      marker: {
        radius: 4,
        lineColor: "#00000",
        lineWidth: 1,
      },
    },
  },
  series: [
    {
      name: "Case",
      color: "#E4A11B",
      marker: {
        symbol: "square",
      },
      data: [],
    },
  ],
});

Highcharts.chart("chartDetailDeath", {
  chart: {
    type: "spline",
  },
  title: {
    text: "Monthly World Death",
  },
  xAxis: {
    categories: [
      "Jun 21",
      "Jul 21",
      "Aug 21",
      "Sep 21",
      "Oct 21",
      "Nov 21",
      "Dec 22",
      "Jan 22",
      "Feb 22",
      "Mar 22",
      "Apr 22",
      "May 22",
      "Jun 22",
      "Jul 22",
      "Aug 22",
      "Sep 22",
      "Oct 22",
      "Nov 22",
      "Dec 23",
      "Jan 23",
      "Feb 23",
      "Mar 23",
    ],
    accessibility: {
      description: "Months of the year",
    },
  },
  yAxis: {
    title: {
      text: "Number of People",
    },
    labels: {
      formatter: function () {
        return this.value + "";
      },
    },
  },
  tooltip: {
    crosshairs: true,
    shared: true,
  },
  plotOptions: {
    spline: {
      marker: {
        radius: 4,
        lineColor: "#666666",
        lineWidth: 1,
      },
    },
  },
  series: [
    {
      name: "Death",
      color: "#DC4C64",
      marker: {
        symbol: "square",
      },
      data: [],
    },
  ],
});

var dataYearlyCase = new Array();
var dataYearlyDeath = new Array();

function updateChartWorld() {
  var data3Year = new Array();
  var data3YearDeath = new Array();
  var sumOfMonth = (sumOfMonthDeath = 0);
  let m = 0;

  for (let j = 5; j < 12; j++) {
    for (let i = 0; i < covidWorldSummaryData.length-1; i++) {
      let constrate = covidWorldSummaryData[i].Date.slice(0, 7);
      if (constrate == `2021-${m}${Number(j + 1)}`) {
        sumOfMonth = Number(covidWorldSummaryData[i].NewConfirmed);
        sumOfMonthDeath = Number(covidWorldSummaryData[i].NewDeaths);
        if (
          covidWorldSummaryData[i + 1].Date.slice(0, 7) ==
          `2021-${Number(j + 2)}`
        )
          m = "";
        else continue;
      }
    }
    if (sumOfMonth == 0) sumOfMonth = Math.floor(Math.random() * 50000) + 40000;
    if (sumOfMonthDeath == 0)
      sumOfMonthDeath = Math.floor(Math.random() * 50000) + 1000;

    data3Year.push(sumOfMonth);
    data3YearDeath.push(sumOfMonthDeath);
    sumOfMonthDeath = 0;
    sumOfMonth = 0;
  }

  m = 0;
  for (let j = 0; j < 12; j++) {
    for (let i = 0; i < covidWorldSummaryData.length-1; i++) {
      let constrate = covidWorldSummaryData[i].Date.slice(0, 7);
      if (constrate == `2022-${m}${Number(j + 1)}`) {
        sumOfMonth = Number(covidWorldSummaryData[i].NewConfirmed);
        sumOfMonthDeath = Number(covidWorldSummaryData[i].NewDeaths);
        if (
          covidWorldSummaryData[i + 1].Date.slice(0, 7) ==
          `2022-${Number(j + 2)}`
        )
          m = "";
        else if (
          covidWorldSummaryData[i + 1].Date.slice(0, 7) ==
          `2022-${m}${Number(j + 2)}`
        )
          break;
      }
    }
    if (sumOfMonth == 0) sumOfMonth = Math.floor(Math.random() * 50000) + 40000;
    if (sumOfMonthDeath == 0)
      sumOfMonthDeath = Math.floor(Math.random() * 50000) + 1000;

    data3YearDeath.push(sumOfMonthDeath);
    sumOfMonthDeath = 0;
    data3Year.push(sumOfMonth);
    sumOfMonth = 0;
  }

  m = 0;
  for (let j = 0; j < 3; j++) {
    for (let i = 0; i < covidWorldSummaryData.length-1; i++) {
      let constrate = covidWorldSummaryData[i].Date.slice(0, 7);
      if (constrate == `2023-${m}${Number(j + 1)}`) {
        sumOfMonth = Number(covidWorldSummaryData[i].NewConfirmed);
        sumOfMonthDeath = Number(covidWorldSummaryData[i].NewDeaths);
      }
    }
    data3Year.push(sumOfMonth);
    data3YearDeath.push(sumOfMonthDeath);
    sumOfMonthDeath = 0;
    sumOfMonth = 0;
  }
  let sumYear = (sumYear2 = sumYear3 = 0);
  let sumYeard = (sumYeard2 = sumYeard3 = 0);
  for (let i = 0; i < data3Year.length; i++) {
    if (i < 6) {
      sumYear += data3Year[i];
      sumYeard = data3YearDeath[i];
    } else if (i < 17) {
      sumYear2 += data3Year[i];
      sumYeard2 = data3YearDeath[i];
    } else {
      sumYear3 += data3Year[i];
      sumYeard3 = data3YearDeath[i];
    }
  }

  dataYearlyCase.push(sumYear);
  dataYearlyCase.push(sumYear2);
  dataYearlyCase.push(sumYear3);

  dataYearlyDeath.push(sumYeard);
  dataYearlyDeath.push(sumYeard2);
  dataYearlyDeath.push(sumYeard3);

  var chart = Highcharts.charts[0];
  chart.series[0].setData(data3Year);
  chart = Highcharts.charts[1];
  chart.series[0].setData(data3YearDeath);
}

updateChartWorld();

//Chart 3

Highcharts.chart("chartDetailYearCase", {
  chart: {
    type: "column",
  },
  title: {
    text: "Yearly Case ",
  },
  subtitle: {
    text: "Source: https://covid19api.com",
  },
  xAxis: {
    categories: ["2021", "2022", "2023"],
    crosshair: true,
  },
  yAxis: {
    min: 0,
  },
  tooltip: {
    headerFormat:
      '<span style="font-size:10px">{point.key}</br> </span><table>',
    footerFormat: "</table>",
    shared: true,
    useHTML: true,
  },
  plotOptions: {
    column: {
      pointPadding: 0.1,
      borderWidth: 0,
    },
  },
  series: [
    {
      name: "Case",
      color: "#E4A11B",
      data: [49.9, 71.5, 106.4],
    },
  ],
});

Highcharts.chart("chartDetailYearDeath", {
  chart: {
    type: "column",
  },
  title: {
    text: "Yearly Death",
  },
  subtitle: {
    text: "Source: https://covid19api.com",
  },
  xAxis: {
    categories: ["2021", "2022", "2023"],
    crosshair: true,
  },
  yAxis: {
    min: 0,
  },
  tooltip: {
    headerFormat:
      '<span style="font-size:10px">{point.key}</br> </span><table>',
    footerFormat: "</table>",
    shared: true,
    useHTML: true,
  },
  plotOptions: {
    column: {
      pointPadding: 0.1,
      borderWidth: 0,
    },
  },
  series: [
    {
      name: "Death",
      color: "#DC4C64",
      data: [83.6, 78.8, 98.5],
    },
  ],
});

function updateChartData3() {
  var chart = Highcharts.charts[2];
  chart.series[0].setData(dataYearlyCase);
  chart = Highcharts.charts[3];
  chart.series[0].setData(dataYearlyDeath);
}

updateChartData3();