const axios = require('axios')
const $ = require('cheerio')
const jsonfile = require('jsonfile')

// Scrapes exercise data from JEFIT database of exercises.

const BASE_URL = 'https://www.jefit.com/exercises/bodypart.php?id=11&exercises=All&All=0&Bands=0&Bench=0&Dumbbell=0&EZBar=0&Kettlebell=0&MachineStrength=0&MachineCardio=0&Barbell=0&BodyOnly=0&ExerciseBall=0&FoamRoll=0&PullBar=0&WeightPlate=0&Other=0&Strength=0&Stretching=0&Powerlifting=0&OlympicWeightLifting=0&Beginner=0&Intermediate=0&Expert=0&page='
const START_PAGE = 1
const END_PAGE = 130


const getPageData = async (url) => {
  const exercises = []

  const response =  await axios.get(url)
  const html = response.data
  
  $("td > h4 ", html).each((i, elem) => {
    exercises.push({
      title: $(elem).children('a').text(),
      exercise_type: $(elem).next().text().split(" : ")[1]
    })
  })
  return exercises
}

(async () => {
  const promises = []
  for (let i=START_PAGE;i<=END_PAGE;i++) {
    promises.push(getPageData(BASE_URL + i))
  }
  const pageExercises = await Promise.all(promises)
  const allExercises = pageExercises.reduce((acc, item) => acc.concat(item))
  await jsonfile.writeFile(`./data/exercises.json`, allExercises)
})();

