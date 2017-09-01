//Global variables
$(document).ready(function() {
 
//audio clips
let audio = new Audio('assets/audio/imperial_march.mp3');
let force = new Audio('assets/audio/force.mp3');
let blaster = new Audio('assets/audio/blaster-firing.mp3');
let jediKnow = new Audio('assets/audio/jedi-know.mp3');
let lightsaber = new Audio('assets/audio/light-saber-on.mp3');
let rtwoo = new Audio('assets/audio/R2D2.mp3');

//Array of Playable Characters
let characters = {
    'rey': {
        name: 'rey',
        capName: 'Rey',
        health: 120,
        attack: 8,
        imageUrl: "assets/images/rey.jpg",
        enemyAttackBack: 15
    }, 
    'darth': {
        name: 'darth',
        capName: 'Darth',
        health: 100,
        attack: 14,
        imageUrl: "assets/images/darth.jpg",
        enemyAttackBack: 5
    }, 
    'finn': {
        name: 'finn',
        capName: 'Finn',
        health: 150,
        attack: 8,
        imageUrl: "assets/images/finn.jpg",
        enemyAttackBack: 20
    }, 
    'stormtrooper': {
        name: 'stormtrooper',
        capName: 'StormTrooper',
        health: 180,
        attack: 7,
        imageUrl: "assets/images/trooper.jpg",
        enemyAttackBack: 20
    }
};

var currSelectedCharacter;
var currDefender;
var currEnemy;
var currDef;
var lastEnemy;
var combatants = [];
var indexofSelChar;
var attackResult;
var turnCounter = 1;
var killCount = 0;
var health = 0;


var renderOne = function(character, renderArea, makeChar) {
    //character: obj, renderArea: class/id, makeChar: string
    var charDiv = $("<div class='character' data-name='" + character.name + "'>");
    var charName = $("<div class='character-name'>").text(character.name);
    var charImage = $("<img alt='image' class='character-image'>").attr("src", character.imageUrl);
    var charHealth = $("<div class='character-health'>").text(character.health);
    charDiv.append(charName).append(charImage).append(charHealth);
    $(renderArea).append(charDiv);

    // conditional render
    if (makeChar == 'enemy') {
     $(charDiv).addClass('enemy');
       currEnemy = character; 
    } else if (makeChar == 'defender') {
      currDefender = character;
      $(charDiv).addClass('target-enemy'); 
      $(charDiv).addClass('text'); 
    } 
  };

  // Create function to render game message to DOM
    var renderMessage = function(message) {
    var gameMesageSet = $("#gameMessage");
    var newMessage = $("<div>").text(message);
    gameMesageSet.append(newMessage);

    if (message == 'clearMessage') {
      gameMesageSet.text('');
    }
  };

  var renderCharacters = function(charObj, areaRender) {
   if (areaRender == '#characters-section') {
      $(areaRender).empty();
      for (var key in charObj) {
        if (charObj.hasOwnProperty(key)) {
          renderOne(charObj[key], areaRender, 'defender');
        }
      }
    }
    //render player character
    if (areaRender == '#selected-character') {
      if ($('#selected-character').children().length === 0) {
        currDef = charObj;
        health = currDef.health;
      }
      renderOne(charObj, areaRender, 'defender2');
      $('#selected-character').prepend("Your Character");
      $('#selected-character').addClass('text2');
      $('#attack-button').addClass('btn'); 
      $('#attack-button').css('visibility', 'visible');
    }
    //render combatants
    if (areaRender == '#available-to-attack-section') {
        $('#available-to-attack-section').addClass('enemytext'); 
       $('#fight-section').prepend("Fight Section"); 
        $('#fight-section').addClass('fighttext'); 
        $('#available-to-attack-section').prepend("Choose Your Opponent"); 

      for (var i = 0; i < charObj.length; i++) {

        renderOne(charObj[i], areaRender, 'enemy');
      }
      //render one enemy to defender area
      $(document).on('click', '.enemy', function() {
        //select an combatant to fight
        name = ($(this).data('name'));
        //if defernder area is empty
        if ($('#selected-character').children().length === 1) {
          renderCharacters(name, '#defender');
          $(this).hide();
          renderMessage("clearMessage");

        }
      });
    } 

    //render defender
    if (areaRender == '#defender') {

      $(areaRender).empty();
      for (var i = 0; i < combatants.length; i++) {
        //add enemy to defender area
          if (combatants[i].name == charObj) {
            $('#selected-character').append("Your Opponent");
            renderOne(combatants[i], "#selected-character", 'defender');

            lastEnemy = combatants[i];
          }
      }
    }



    //re-render defender when attacked
    if (areaRender == 'playerDamage') {
      $('#selected-character').empty();
      $('#selected-character').prepend("Your Character");

      renderOne(charObj,'#selected-character', 'defender');
      lightsaber.play();
    }
    //re-render player character when attacked
    if (areaRender == 'enemyDamage') {
        $('#selected-character').append("Your Opponent");
        charObj.health = currSelectedCharacter.health;
        renderOne(charObj, '#selected-character', 'defender'); 
    }
    //render defeated enemy
    if (areaRender == 'enemyDefeated') {
      $('#selected-character').empty();
      charObj.health = health;
      $('#selected-character').prepend("Your Character");
      renderOne(charObj, '#selected-character', 'defender'); 
      var gameStateMessage = "You have defeated " + lastEnemy.capName + ", you can choose to fight another enemy.";
      renderMessage(gameStateMessage);
      blaster.play();
    }
  };

  //this is to render all characters for user to choose their computer
  renderCharacters(characters, '#characters-section');
  $(document).on('click', '.character', function() {
    name = $(this).data('name');
    //if no player char has been selected
    if (!currSelectedCharacter) {
      currSelectedCharacter = characters[name];
      for (var key in characters) {
        if (key != name) {
          combatants.push(characters[key]);
        }
      }
      $("#characters-section").hide();
      renderCharacters(currSelectedCharacter, '#selected-character');
         
      //this is to render all characters for user to choose fight against
      renderCharacters(combatants, '#available-to-attack-section');
    }
  });

  // ----------------------------------------------------------------
  // Create functions to enable actions between objects.
    $("#attack-button").on("click", function() {
  
    //if defernder area has enemy
    currEnemy = currDefender;
    if ($('#selected-character').children().length !== 1) {
      //defender state change
      var attackMessage = "You attacked " + currDefender.capName + " for " + (currSelectedCharacter.attack * turnCounter) + " damage.";
      renderMessage("clearMessage");
      //combat
      currDefender.health = currDefender.health - (currSelectedCharacter.attack * turnCounter);

      //win condition
      if (currDefender.health > 0) {
        //enemy not dead keep playing
        renderCharacters(currSelectedCharacter, 'playerDamage');
        //player state change
        var counterAttackMessage = currEnemy.capName + " attacked you back for " + currDefender.enemyAttackBack + " damage.";
        renderMessage(attackMessage);
        renderMessage(counterAttackMessage);
        currSelectedCharacter.health = currSelectedCharacter.health - currDefender.enemyAttackBack;

        renderCharacters(currEnemy, 'enemyDamage'); 
        if (currSelectedCharacter.health <= 0) {
          renderMessage("clearMessage");
          restartGame("You have been defeated...GAME OVER!!!");
          force.play();
          $("#attack-button").unbind("click");
        }
      } else {
        renderCharacters(currDef, 'enemyDefeated');
        killCount++;
        if (killCount >= 3) {
          renderMessage("clearMessage");
          restartGame("You Won!!!! GAME OVER!!!");
          jediKnow.play();
          // The following line will play the imperial march:
          setTimeout(function() {
          audio.play();
          }, 2000);

        }
      }
      turnCounter++;
    } else {
      renderMessage("clearMessage");
      renderMessage("No Selected Enemy");
      rtwoo.play();
    }
  });

//Restarts the game - renders a reset button
  var restartGame = function(inputEndGame) {
    //When 'Restart' button is clicked, reload the page.
    var restart = $('<button class="btn">Restart</button>').click(function() {
      location.reload();
    });
    var gameState = $("<div>").text(inputEndGame);
    $("#gameMessage").append(gameState);
    $("#gameMessage").append(restart);
  };

});
