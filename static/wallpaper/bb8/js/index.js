const $w = $(window).width();
const $dW = parseInt($('.bb8').css('width'));

// Physics constants
const springConstant = 0.1;
const dampingFactor = 0.1;
const mass = 0.1;

// State variables
let position = 0;
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
  position += velocity * deltaTime;
  rotation += velocity * deltaTime; // Rotation proportional to velocity

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

// Start animation loop
requestAnimationFrame(updatePhysics);

// Mouse movement handler
$(document).on('mousemove', (event) => {
  $('h2').addClass('hide');
  $mPos = event.pageX;
});