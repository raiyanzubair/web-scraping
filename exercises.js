const puppeteer = require('puppeteer')
const $ = require('cheerio')
const jsonfile = require('jsonfile')

// Scrapes exercise data from JEFIT database of exercises.

const file = './exercises.json'
const BASE_URL = "https://www.jefit.com/exercises"
const START_URL = 'https://www.jefit.com/exercises/bodypart.php?id=11&exercises=All&All=0&Bands=0&Bench=0&Dumbbell=0&EZBar=0&Kettlebell=0&MachineStrength=0&MachineCardio=0&Barbell=0&BodyOnly=0&ExerciseBall=0&FoamRoll=0&PullBar=0&WeightPlate=0&Other=0&Strength=0&Stretching=0&Powerlifting=0&OlympicWeightLifting=0&Beginner=0&Intermediate=0&Expert=0&page=1'

const exercises = []

const getPageData = async (page, url) => {
  await page.goto(url);
  const html = await page.content()
  $("td > h4 ", html).each((i, elem) => {
    exercises.push({
      title: $(elem).children('a').text(),
      exercise_type: $(elem).next().text().split(" : ")[1]
    })
  })
  const nextPageButton = $("a[rel='next']", html)[0]
  let nextPageURL = $(nextPageButton).attr('href')
  if (nextPageURL) {
    nextPageURL = nextPageURL.substring(1, nextPageURL.length)
    nextPageURL = `${BASE_URL}${nextPageURL}`
    await getPageData(page, nextPageURL)
  }
}

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await getPageData(page, START_URL)

  await browser.close();
  await jsonfile.writeFile(file, exercises)
})();

