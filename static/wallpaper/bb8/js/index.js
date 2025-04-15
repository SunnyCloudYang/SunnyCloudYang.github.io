let $w = $(window).width();
const $dW = parseInt($('.bb8').css('width'));
const $maxVelocity = 0.8 * $w;
const $maxOutRange = 2 * $dW;

// Physics constants
let springConstant = 0.1;
let dampingFactor = 0.1;
let mass = 0.1;

// State variables
let position = $w / 2;
let velocity = 0;
let lastTime = performance.now();
let $mPos = $w - $w/5;
let isMovingRight = false;
let rotation = 0;

const updatePhysics = (currentTime) => {
  const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
  lastTime = currentTime;

  // Spring physics
  const displacement = $mPos - position;
  const springForce = springConstant * displacement;
  const dampingForce = -dampingFactor * velocity;
  const netForce = springForce + dampingForce;
  
  // Update velocity and position using physics integration
  const acceleration = netForce / mass;
  velocity += acceleration * deltaTime;
  velocity = Math.max(-$maxVelocity, Math.min($maxVelocity, velocity)); // Limit velocity
  position += velocity * deltaTime;
  position = Math.max(-$maxOutRange, Math.min($w + $maxOutRange, position)); // Limit position
  rotation += velocity * deltaTime;

  // Update visual direction
  if (displacement > 0.1 && !isMovingRight) {
    isMovingRight = true;
    $('.antennas').addClass('right');
    $('.eyes').addClass('right');
  } else if (displacement < -0.1 && isMovingRight) {
    isMovingRight = false;
    $('.antennas').removeClass('right');
    $('.eyes').removeClass('right');
  }

  // Update DOM
  $('.bb8').css('left', position);
  $('.ball').css({
    transform: `rotate(${rotation}deg)`,
    WebkitTransform: `rotate(${rotation}deg)`,
    MozTransform: `rotate(${rotation}deg)`
  });

  requestAnimationFrame(updatePhysics);
};

let showTime = localStorage.getItem('showTime') === 'true' || false;
let showSeconds = localStorage.getItem('showSeconds') === 'true' || true;
let is24HourFormat = localStorage.getItem('is24HourFormat') === 'true' || true;
let timeoutId;
$(() => {
  $(".clock").toggle(showTime);
  // Initialize clock
  setInterval(() => {
    const now = new Date();
    const hours = is24HourFormat ? now.getHours() : now.getHours() % 12 || 12;
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');

    const date = now.toLocaleDateString({
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    $('.date').text(date);

    const day = now.toLocaleDateString('en-US', {
      weekday: 'short'
    });
    $('.day').text(day);

    $('.time').text(`${hours}:${minutes}${showSeconds ? ':' + seconds : ''} ${is24HourFormat ? '' : (now.getHours() >= 12 ? ' PM' : ' AM')}`);

  }, 100);

  // Show/hide clock on click
  $('.bb8').on('dblclick', () => {
    clearTimeout(timeoutId);
    showTime = !showTime;
    localStorage.setItem('showTime', showTime);
    $('.clock').fadeToggle("fast");
  });

  // Toggle seconds on double click
  $('.bb8').on('click', () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      showTime && (showSeconds = !showSeconds);
      localStorage.setItem('showSeconds', showSeconds);
    }, 300);
  });

  // Toggle time format on right click
  $(document).on('contextmenu', (event) => {
    event.preventDefault();
    is24HourFormat = !is24HourFormat;
    localStorage.setItem('is24HourFormat', is24HourFormat);
  });
});

// Mouse movement handler
$(document).on('mousemove', (event) => {
  $('h2').addClass('hide');
  $mPos = event.pageX;
});

window.addEventListener('resize', () => {
  // Update $w and $mPos on resize
  $w = $(window).width();
  $mPos = $w - $w/5;
});

window.wallpaperPropertyListener = {
  applyUserProperties: function (properties) {
    if (properties.displaytime) {
      showTime = properties.displaytime.value;
      localStorage.setItem('showTime', showTime);
      showTime ? $('.clock').fadeIn("fast") : $('.clock').fadeOut("fast");
    }
    if (properties.groundcolor) {
      const color = properties.groundcolor.value.split(' ').map(c => Math.ceil(c * 255));
      $('.sand').css('background', `rgb(${color.join(', ')})`);
    }
    if (properties.showseconds) {
      showSeconds = properties.showseconds.value;
      localStorage.setItem('showSeconds', showSeconds);
    }
    if (properties.springconstant) {
      springConstant = Number(properties.springconstant.value);
    }
    if (properties.dampfactor) {
      dampingFactor = Number(properties.dampfactor.value);
    }
    if (properties.mess) {
      mass = Number(properties.mess.value);
    }
    if (properties._24hour) {
      is24HourFormat = properties._24hour.value;
      localStorage.setItem('is24HourFormat', is24HourFormat);
    }
  },
};

// Start animation loop
requestAnimationFrame(updatePhysics);
