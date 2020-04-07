function initCharacter(data, diseases) {
  var character = {};
  character.ugcloud = data[0];
  character.name = data[1];
  character.pc = data[2];
  character.generation = data[4];
  character.gender = data[5];
  character.province = data[7];
  character.ses = data[8];
  character.born = data[9];
  character.ethnicity = data[10];
  character.married = data[11];
  character.savings = data[12];
  character.deaf = data[13];
  character.blind = data[14];
  character.sterile = data[15];
  character.crippled = data[16];
  character.intellectualDisability = data[17];
  character.diseases = {};
  getDiseases(character, diseases);
  return character;
}


function getLivingCharacters(workbook) {
  var livingCharacters = [];
  var characterData = workbook.getSheetByName('Characters').getDataRange().getValues();
  var diseases = workbook.getSheetByName('Diseases').getDataRange().getValues();
  for (var x=1; x<characterData.length; x++) {
    if (characterData[x][2] === true && characterData[x][3] === true) {
      livingCharacters.push(initCharacter(characterData[x], diseases));
    }
  }
  return livingCharacters;
}


function updateCharacter(characterName, column, value, workbook) {
  var characterSheet = workbook.getSheetByName('Characters');
  var characterList = characterSheet.getDataRange().getValues();
  for (var x=1;x<characterList.length;x++){
    if (characterList[x][1] === characterName) {
      characterSheet.getRange(x+1, column).setValue(value);
    }
  }
}


function getDiseases(character, diseases) {
  var characterDiseases = {};
  for (var x=1;x<diseases.length;x++) {
    if (diseases[x][1] === character.name) {
      if (!(character.diseases.hasOwnProperty(diseases[x][2]))) {
        character.diseases[diseases[x][2]] = [diseases[x][0],diseases[x][3],diseases[x][4],diseases[x][5],diseases[x][6],diseases[x][7],diseases[x][8]];
      }
    }
  }
}


function resolveDiseases(character, year, infantMortalityRate, story) {
  for (diseaseName in character.diseases) {
    if (character.diseases[diseaseName][0] === year-1) {
      if ((year - 1) - character.born == 0) {
        if (Math.random() < infantMortalityRate){
          story = story + '\nYou died from ' + diseaseName;
          return [false, story];
        }
      }
      else if (character.diseases[diseaseName][1] === 'Death') {
        story = story + '\nYou died from ' + diseaseName;
        return [false, story];
      }
      else {
        story = story + '\nYour ' + diseaseName + ' resolved in ' + character.diseases[diseaseName][1];
        if (character.diseases[diseaseName][2]) {
          story = story + ', but it left you deaf';
        }
        if (character.diseases[diseaseName][3]) {
          story = story + ', but it left you blind';
        }
        if (character.diseases[diseaseName][4]) {
          story = story + ', but it left you sterile';
        }
        if (character.diseases[diseaseName][5]) {
          story = story + ', but it left you crippled';
        }
        if (character.diseases[diseaseName][6]) {
          story = story + ', but it left you with an intellectual disability';
        }
      }
    }
  }
  return [true, story];
}


function disease(character, year, age, diseaseCatalogue, workbook, story) {

  for (var x=1;x<diseaseCatalogue.length;x++) {
    if (year >= diseaseCatalogue[x][1] && 
        year <= diseaseCatalogue[x][2] && 
        age >= diseaseCatalogue[x][3] && 
        age <= diseaseCatalogue[x][4] && 
        diseaseCatalogue[x][6] >= Math.random() &&
        (!(character.diseases.hasOwnProperty(diseaseCatalogue[x][0])))){
          story = story + '\nYou got ' + diseaseCatalogue[x][0];
          workbook.getSheetByName('Diseases').appendRow([year, 
                                                         character.name, 
                                                         diseaseCatalogue[x][0], 
                                                         diseaseCatalogue[x][5], 
                                                         diseaseCatalogue[x][7], 
                                                         diseaseCatalogue[x][8], 
                                                         diseaseCatalogue[x][9], 
                                                         diseaseCatalogue[x][10], 
                                                         diseaseCatalogue[x][11]]);
          if (diseaseCatalogue[x][7]) {
            updateCharacter(character.name, 14, 'TRUE', workbook);
          }
          if (diseaseCatalogue[x][8]) {
            updateCharacter(character.name, 15, 'TRUE', workbook);
          }
          if (diseaseCatalogue[x][9]) {
            updateCharacter(character.name, 16, 'TRUE', workbook);
          }
          if (diseaseCatalogue[x][10]) {
            updateCharacter(character.name, 17, 'TRUE', workbook);
          }
          if (diseaseCatalogue[x][11]) {
            updateCharacter(character.name, 18, 'TRUE', workbook);
          }
          return story;
    }
  }
  return story;
}


function getMedianIncome(year, incomes) {
  for (var x=1;x<incomes.length;x++){
    if (year === incomes[x][0]) {
      return incomes[x][1];
    }
  }
}


function getInfantMortalityRate(year, infantMortality) {
  for (var x=1;x<infantMortality.length;x++) {
    if (year >= infantMortality[x][0] && year <= infantMortality[x][1]) {
      return infantMortality[x][2] * 0.001;
    }
  }
}



function getPrimeRate(year, primeRates) {
  for (var x=1;x<primeRates.length;x++) {
    if (primeRates[x][0] === year) {
      return primeRates[x][1];
    }
  }
  return 0.04;
}

function getFertilityRate(year, allFertility) {
  for (var x=1;x<allFertility.length;x++) {
    if (allFertility[x][0] === year) {
      return allFertility[x][1];
    }
  }
  return 5;
}


function income(character, year, medianIncome, workbook){
  var baseModifier;
  if (character.ses === 'Low') {
    baseModifier = 0.3;
  }
  else if (character.ses === 'Middle') {
    baseModifier = 0.8;
  }
  else {
    baseModifier = 1.6;
  }
  var income = Math.round((medianIncome*baseModifier)+((medianIncome*Math.random())/2));
  return income;
}


function adjustIncomeForAge(character, year, age, characterIncome) {
  if (character.ses === 'Low') {
    if (year<1940) {
      if (age<8) {
        characterIncome = 0;
      }
      else if (age<14) {
        characterIncome = characterIncome * 0.4;
      }
      else if (age<18) {
        characterIncome = characterIncome * 0.8;
      }
    }
    else if (year<1980) {
      if (age<16) {
        characterIncome = 0;
      }
    }
    else if (age<18) {
      characterIncome = 0;
    }
  }
  else if (character.ses === 'Middle') {
    if (year<1940) {
      if (age<14) {
        characterIncome = 0;
      }
      else if (age<14) {
        characterIncome = characterIncome * 0.11;
      }
      else if (age<18) {
        characterIncome = characterIncome * 0.8;
      }
    }
    else if (year<1980) {
      if (age<16) {
        characterIncome = 0;
      }
      else if (age<18) {
        characterIncome = characterIncome * 0.8;
      }
    }
    else if (age<25) {
      characterIncome = 0;
    }
  }
  else {
    if (age<25) {
      characterIncome = 0;
    }
  }
  return characterIncome;
}

function getHouseholdSpending(year, allHouseholdSpending) {
  for (var x=1;x<allHouseholdSpending.length;x++) {
    if (allHouseholdSpending[x][0] <= year && allHouseholdSpending[x][1] >= year) {
      return allHouseholdSpending[x];
    }
  }
}


function marriage(character, year, age, workbook) {
  var baseRate = 0.3;
  var modifier = 1;
  if (character.deaf || character.blind) {
    modifier = modifier * 0.7;
  }
  if (character.sterile || character.crippled) {
    modifier = modifier * 0.3;
  }
  if (character.intellectualDisability) {
    modifier = 0;
  }
  if (baseRate * modifier >= Math.random()) {
    return true;
  }
  return false;
}


function getChildren(character, workbook) {
  var children = [];
  var characters = workbook.getSheetByName('Characters').getDataRange().getValues();
  for (var x=1;x<characters.length;x++) {
    if (characters[x][0] === character.ugcloud && characters[x][4] === character.generation + 1)
      children.push(characters[x]);
  }
  return children;
}


function haveChildren(character, year, infantMortality, workbook, story) {
  if (Math.random() < 0.1) {
    story = story + '\nYou had a baby!';
    if (Math.random() < infantMortality) {
      story = story + '\nBut it died as an infant';
    }
    else {
      Logger.log('Baby ' + character.name);
      workbook.getSheetByName('Characters').appendRow([character.ugcloud, 
                                                       character.name + ' Jr.', 
                                                       'FALSE', 
                                                       'TRUE', 
                                                       character.generation + 1,
                                                       '',
                                                       '',
                                                       character.province,
                                                       character.ses,
                                                       year,
                                                       character.ethnicity,
                                                       'FALSE',
                                                       0,
                                                       'FALSE',
                                                       'FALSE',
                                                       'FALSE',
                                                       'FALSE',
                                                       'FALSE'])
    }
  }
  return story;
}


function expenses(character, income, householdSpending, story){
  var food = Math.round(income * householdSpending[2]);
  story = story + '\nYou spent $' + food + ' on food: $' + Math.round(food/52) + ' per week';
  var housing = Math.round(income * householdSpending[3]);
  story = story + '\nYou spent $' + housing + ' on housing: $' + Math.round(housing/12) + ' per month';
  var apparel = Math.round(income * householdSpending[4]);
  story = story + '\nYou spent $' + apparel + ' on apparel: $' + Math.round(apparel/12) + ' per month';
  var entertainment = Math.round(income * householdSpending[5]);
  story = story + '\nYou spent $' + entertainment + ' on entertainment: $' + Math.round(entertainment/52) + ' per week';
  var miscellaneous;
  var savings;
  if (character.ses === 'Upper') {
    miscellaneous = income * householdSpending[7] / 2;
    savings = (income * householdSpending[6]) + miscellaneous;
  }
  else if (character.ses === 'Lower') {
    miscellaneous = income * (householdSpending[6] + householdSpending[7]);
    savings = 0;
  }
  else {
    miscellaneous = income * householdSpending[7];
    savings = income * householdSpending[6];
  }
  story = story + '\nYou spent $' + Math.round(miscellaneous) + ' on miscellaneous';
  story = story + '\nYou saved $' + Math.round(savings);
  return [savings, story];
}

  
function conscript(year, character, age, story, workbook) {
  if (year === 1915) {
    story = story + '\nYou volunteered to help with the war effort! You were sent to Ypres';
  }
  else if (year === 1916) {
    story = story + '\nYou volunteered to help with the war effort! You were sent to the Somme';
  }
  else if (year === 1917) {
    story = story + '\nYou were conscripted to help with the war effort! You were sent to Ypres';
  }
  else if (year === 1918) {
    story = story + '\nYou were conscripted to help with the war effort! You were involved in the Hundred Days Offensive';
  }
  let luck = Math.random();
  if (luck < 0.2) {
    story = story + '\nYou were killed in battle!';
    return [false, story];
  }
  else if (luck < 0.4) {
    story = story + '\nYou were injured in battle.  One of your limbs was amputated';
    updateCharacter(character.name, 17, 'TRUE', workbook);
  }
return [true, story];
}


function kill(character, story, workbook) {
  updateCharacter(character.name, 3, 'FALSE', workbook);
  updateCharacter(character.name, 4, 'FALSE', workbook);
  var heirs = getChildren(character, workbook);
  if (heirs.length === 0) {
    story = story + '\nYou have no heirs! Your dynasty has ended!  See me to create a new character';
  }
  else {
    var inheritance = character.savings / heirs.length;
    var heir = heirs[Math.floor(Math.random()*heirs.length)];
    updateCharacter(heir[1], 3, 'TRUE', workbook);
    updateCharacter(heir[1], 13, inheritance, workbook);
    story = story + '\nYou are now playing as ' + heir[1] + '.  You inherited $' + Math.round(inheritance);
  }
  return story;
}


function oneYearPasses() {
  var workbook = SpreadsheetApp.getActive();
  var yearCell = workbook.getSheetByName('Year').getRange('B1');
  var year = yearCell.getValue();
  Logger.log(year);

  var livingCharacters = getLivingCharacters(workbook);
  var diseaseCatalogue = workbook.getSheetByName('Disease Catalogue').getDataRange().getValues();
  
  var incomes = workbook.getSheetByName('Median Income').getDataRange().getValues();
  var medianIncome = getMedianIncome(year, incomes);
  Logger.log('median income: ' + medianIncome);
  
  var infantMortality = workbook.getSheetByName('Infant Mortality').getDataRange().getValues();
  var infantMortalityRate = getInfantMortalityRate(year, infantMortality);
  
  var primeRates = workbook.getSheetByName('Prime Rate').getDataRange().getValues();
  var primeRate = getPrimeRate(year, primeRates);
  Logger.log('Prime Rate: ' + primeRate);
  
  var allHouseholdSpending = workbook.getSheetByName('Expenses').getDataRange().getValues();
  var householdSpending = getHouseholdSpending(year, allHouseholdSpending);
  
  var allFertility = workbook.getSheetByName('Fertility Rate').getDataRange().getValues();
  var kidsPerWoman = getFertilityRate(year, allFertility);
  
  for (var x=0;x<livingCharacters.length;x++) {
    var character = livingCharacters[x];
    var story = year + ' in the life of ' + character.name;
    story = story + '\n\nThe infant mortality rate is ' + Math.round(infantMortalityRate*100) + '%';
    story = story + '\nThe median income is $' + Math.round(medianIncome);
    var age = Math.round(year - character.born);
    story = story + '\n\nYou are ' + Math.round(age) + ' years old';
    story = story + '\nYou live in ' + character.province;
    story = story + '\nYou are ' + character.ses + ' class';
    story = story + '\nYou are of ' + character.ethnicity + ' ancestry';
    if (character.married) {
      story = story + '\nYou are married';
    }
    
    let alive = true;
    
//    if (year => 1915 && 
//        year <= 1918 &&
//        character.gender === "Male" &&
//        age >= 18 &&
//        age <= 50 &&
//        !character.deaf &&
//        !character.blind &&
//        !character.crippled &&
//        !character.intellectualDisability) {    
//      let conscriptionResults = conscript(year, character, age, story, workbook);
//      story = conscriptionResults[1];
//      alive = conscriptionResults[0];
//    }
    if (alive) {
      let diseaseResults = resolveDiseases(character, year, infantMortalityRate, story);
      story = diseaseResults[1];
      alive = diseaseResults[0];
    }
    if (alive) {  
      story = disease(character, year, age, diseaseCatalogue, workbook, story);
      var interest = character.savings * (primeRate + (Math.random()/5));
      if (interest > 0) {
        story = story + '\nYou made $' + Math.round(interest) + ' in interest on your savings and investments';
      }
      var characterIncome = income(character, year, medianIncome, workbook);
      characterIncome = adjustIncomeForAge(character, year, age, characterIncome);
      if (characterIncome > 0) {
        workbook.getSheetByName('Income').appendRow([year, character.name, characterIncome]);
        story = story + '\nYou made $' + Math.round(characterIncome) + ' in income, ' + Math.round(characterIncome/medianIncome*100) + '% median';
        var expenseResults = expenses(character, characterIncome, householdSpending, story);
        story = expenseResults[1];
        var annualSavings = expenseResults[0];
        var savings = character.savings + interest + annualSavings;
        updateCharacter(character.name, 13, savings, workbook);
        story = story + '\nYou currently have $' + Math.round(savings) + ' in savings and investments';
      }
      else {
        story = story + '\nYou currently have $' + Math.round(character.savings) + ' in savings';
      }
      var currentChildren = getChildren(character, workbook);
      story = story + '\nYou have ' + currentChildren.length + ' children';
      if (!(character.married)) {
        if (age>14 && marriage(character, year, workbook)) {
          updateCharacter(character.name, 12, 'TRUE', workbook);
          story = story + '\nYou got married!';
        }
      }
      else {
        if (!(character.sterile) && currentChildren.length < kidsPerWoman) {
          story = haveChildren(character, year, infantMortality, workbook, story);
        }
      }
    }
    else {
      story = kill(character, story, workbook);
    }
    GmailApp.createDraft(character.ugcloud, year + ' in the life of ' + character.name, story);
//    GmailApp.sendEmail(character.ugcloud, year + ' in the life of ' + character.name, story);
  }
  year = year + 1;
  yearCell.setValue(year);
}
