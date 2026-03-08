import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Heart, X } from "lucide-react";
import { Button } from "./ui/button";

export function WeddingGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const [showStartScreen, setShowStartScreen] = useState(true);

  // Touch/Click handler for mobile
  const handleCanvasClick = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Trigger spacebar event
    const event = new KeyboardEvent('keydown', { code: 'Space', key: ' ' });
    window.dispatchEvent(event);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 400;

    // Game variables
    let animationId: number;
    let frameCount = 0;
    let gameSpeed = 6;
    let baseSpeed = 6;
    let gravity = 0.6;
    let score = 0;
    let highScore = 0;
    let gameOver = false;
    let gameStarted = false;

    // Player (Bride/Groom)
    const player = {
      x: 50,
      y: 0,
      width: 40,
      height: 60,
      velocityY: 0,
      jumping: false,
      grounded: true, // Start grounded so player can jump immediately
    };

    // Obstacles (Wedding cakes, flowers, champagne glasses)
    interface Obstacle {
      x: number;
      y: number;
      width: number;
      height: number;
      type: "cake" | "flower" | "champagne";
    }

    let obstacles: Obstacle[] = [];
    let obstacleTimer = 0;
    let obstacleInterval = 80; // Start with random interval
    let minObstacleInterval = 50; // Minimum gap between obstacles
    let maxObstacleInterval = 120; // Maximum gap between obstacles

    // Ground level
    const groundY = canvas.height - 100;
    player.y = groundY - player.height;

    // Draw player (Bride in white dress)
    function drawPlayer() {
      if (!ctx) return;
      
      // Body (wedding dress) - with outline for contrast
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.moveTo(player.x + player.width / 2, player.y + 20);
      ctx.lineTo(player.x + player.width, player.y + player.height);
      ctx.lineTo(player.x, player.y + player.height);
      ctx.closePath();
      ctx.fill();
      
      // Outline for dress
      ctx.strokeStyle = "#8B7355";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Head
      ctx.fillStyle = "#FFB6C1";
      ctx.beginPath();
      ctx.arc(player.x + player.width / 2, player.y + 10, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#8B7355";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Veil
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.fillRect(player.x + player.width / 2 - 8, player.y, 16, 8);
      ctx.strokeStyle = "#C6A75E";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(player.x + player.width / 2 - 8, player.y, 16, 8);

      // Heart on dress - larger and more visible
      ctx.fillStyle = "#DC143C";
      ctx.font = "24px Arial";
      ctx.fillText("♥", player.x + player.width / 2 - 9, player.y + 42);
    }

    // Draw obstacles
    function drawObstacle(obs: Obstacle) {
      if (!ctx) return;

      if (obs.type === "cake") {
        // Wedding cake - white with strong outline
        ctx.fillStyle = "#FFFFFF";
        
        // Bottom tier
        ctx.fillRect(obs.x, obs.y + obs.height - 30, obs.width, 30);
        ctx.strokeStyle = "#8B4513";
        ctx.lineWidth = 3;
        ctx.strokeRect(obs.x, obs.y + obs.height - 30, obs.width, 30);
        
        // Middle tier
        ctx.fillRect(obs.x + 8, obs.y + obs.height - 50, obs.width - 16, 20);
        ctx.strokeRect(obs.x + 8, obs.y + obs.height - 50, obs.width - 16, 20);
        
        // Top tier
        ctx.fillRect(obs.x + 16, obs.y + obs.height - 65, obs.width - 32, 15);
        ctx.strokeRect(obs.x + 16, obs.y + obs.height - 65, obs.width - 32, 15);
        
        // Heart on top - bright red
        ctx.fillStyle = "#FF1493";
        ctx.font = "bold 20px Arial";
        ctx.fillText("♥", obs.x + obs.width / 2 - 7, obs.y + obs.height - 67);
        
      } else if (obs.type === "flower") {
        // Flower bouquet - bright pink with dark outline
        ctx.fillStyle = "#FF69B4";
        ctx.strokeStyle = "#8B008B";
        ctx.lineWidth = 2.5;
        
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          ctx.arc(
            obs.x + obs.width / 2 + Math.cos((i * Math.PI * 2) / 5) * 10,
            obs.y + 15 + Math.sin((i * Math.PI * 2) / 5) * 10,
            8,
            0,
            Math.PI * 2
          );
        }
        ctx.fill();
        ctx.stroke();
        
        // Stem - dark green
        ctx.fillStyle = "#228B22";
        ctx.fillRect(obs.x + obs.width / 2 - 3, obs.y + 25, 6, obs.height - 25);
        ctx.strokeStyle = "#006400";
        ctx.lineWidth = 2;
        ctx.strokeRect(obs.x + obs.width / 2 - 3, obs.y + 25, 6, obs.height - 25);
        
      } else if (obs.type === "champagne") {
        // Champagne glass - bright gold with dark outline
        ctx.fillStyle = "#FFD700";
        ctx.strokeStyle = "#8B6914";
        ctx.lineWidth = 2.5;
        
        // Glass
        ctx.beginPath();
        ctx.moveTo(obs.x + obs.width / 2 - 8, obs.y);
        ctx.lineTo(obs.x + obs.width / 2 + 8, obs.y);
        ctx.lineTo(obs.x + obs.width / 2 + 4, obs.y + 25);
        ctx.lineTo(obs.x + obs.width / 2 - 4, obs.y + 25);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Stem
        ctx.fillRect(obs.x + obs.width / 2 - 2, obs.y + 25, 4, 15);
        ctx.strokeRect(obs.x + obs.width / 2 - 2, obs.y + 25, 4, 15);
        
        // Base
        ctx.fillRect(obs.x + obs.width / 2 - 7, obs.y + 40, 14, 4);
        ctx.strokeRect(obs.x + obs.width / 2 - 7, obs.y + 40, 14, 4);
        
        // Bubbles - white
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(obs.x + obs.width / 2 - 3, obs.y + 8, 2.5, 0, Math.PI * 2);
        ctx.arc(obs.x + obs.width / 2 + 2, obs.y + 12, 2.5, 0, Math.PI * 2);
        ctx.arc(obs.x + obs.width / 2, obs.y + 18, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw ground
    function drawGround() {
      if (!ctx) return;
      ctx.fillStyle = "#A3B18A";
      ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
      
      // Grass pattern
      ctx.fillStyle = "#8fa175";
      for (let i = 0; i < canvas.width; i += 20) {
        ctx.fillRect(i, groundY, 2, 10);
      }
    }

    // Draw background
    function drawBackground() {
      if (!ctx) return;
      
      // Sky gradient - lighter/paler for better contrast
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "#FDF8F5");
      gradient.addColorStop(1, "#FEFCFA");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, groundY);

      // Hearts in background - much lighter
      ctx.fillStyle = "rgba(198, 167, 94, 0.08)";
      ctx.font = "30px Arial";
      for (let i = 0; i < 5; i++) {
        ctx.fillText("♥", 100 + i * 150 - (frameCount % 300), 50 + Math.sin(frameCount * 0.01 + i) * 20);
      }
    }

    // Draw score
    function drawScore() {
      if (!ctx) return;
      ctx.fillStyle = "#C6A75E";
      ctx.font = "bold 24px Arial";
      ctx.fillText(`Punkte: ${Math.floor(score)}`, 20, 40);
      ctx.fillText(`Bester: ${Math.floor(highScore)}`, 20, 70);
    }

    // Collision detection
    function checkCollision(obs: Obstacle): boolean {
      return (
        player.x < obs.x + obs.width &&
        player.x + player.width > obs.x &&
        player.y < obs.y + obs.height &&
        player.y + player.height > obs.y
      );
    }

    // Update game
    function update() {
      if (!gameStarted || gameOver) return;

      frameCount++;

      // Update player
      if (player.jumping) {
        player.velocityY += gravity;
        player.y += player.velocityY;

        if (player.y >= groundY - player.height) {
          player.y = groundY - player.height;
          player.velocityY = 0;
          player.jumping = false;
          player.grounded = true;
        }
      }

      // Spawn obstacles
      obstacleTimer++;
      if (obstacleTimer > obstacleInterval) {
        obstacleTimer = 0;
        const types: ("cake" | "flower" | "champagne")[] = ["cake", "flower", "champagne"];
        const type = types[Math.floor(Math.random() * types.length)];
        
        let height = 65;
        if (type === "flower") height = 50;
        if (type === "champagne") height = 45;

        obstacles.push({
          x: canvas.width,
          y: groundY - height,
          width: 40,
          height: height,
          type: type,
        });

        // Randomize obstacle interval
        obstacleInterval = Math.floor(Math.random() * (maxObstacleInterval - minObstacleInterval + 1)) + minObstacleInterval;
      }

      // Update obstacles
      obstacles = obstacles.filter((obs) => obs.x + obs.width > 0);
      obstacles.forEach((obs) => {
        obs.x -= gameSpeed;

        // Check collision
        if (checkCollision(obs)) {
          gameOver = true;
          if (score > highScore) {
            highScore = score;
          }
        }
      });

      // Update score
      score += 0.1;

      // Increase difficulty
      if (frameCount % 500 === 0) {
        gameSpeed += 0.5;
      }
      
      // Progressively increase difficulty - speed increases more smoothly
      if (frameCount % 200 === 0) {
        gameSpeed += 0.2;
        // Also reduce obstacle intervals to make it harder
        if (maxObstacleInterval > 60) {
          maxObstacleInterval -= 3;
        }
        if (minObstacleInterval > 30) {
          minObstacleInterval -= 2;
        }
      }
    }

    // Draw game
    function draw() {
      if (!ctx || !canvas) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw elements
      drawBackground();
      drawGround();
      obstacles.forEach(drawObstacle);
      drawPlayer();
      drawScore();

      if (!gameStarted) {
        // Fancy start screen with gradient background
        ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Title with hearts
        ctx.fillStyle = "#C6A75E";
        ctx.font = "bold 48px Arial";
        ctx.textAlign = "center";
        ctx.fillText("♥ Hochzeits-Runner ♥", canvas.width / 2, canvas.height / 2 - 100);
        
        // Funny quote
        ctx.fillStyle = "#E8C7C8";
        ctx.font = "italic 22px Arial";
        ctx.fillText("\"Die Ehe ist wie ein Marathon -", canvas.width / 2, canvas.height / 2 - 40);
        ctx.fillText("nur mit mehr Hindernissen!\" 😅", canvas.width / 2, canvas.height / 2 - 10);
        
        // Instructions
        ctx.fillStyle = "#F6F1E9";
        ctx.font = "bold 28px Arial";
        ctx.fillText("Steuerung:", canvas.width / 2, canvas.height / 2 + 40);
        
        ctx.font = "24px Arial";
        ctx.fillText("🎮 LEERTASTE = Springen", canvas.width / 2, canvas.height / 2 + 75);
        ctx.fillText("📱 Tippen = Springen (Mobile)", canvas.width / 2, canvas.height / 2 + 105);
        
        // Start message
        ctx.fillStyle = "#A3B18A";
        ctx.font = "bold 20px Arial";
        ctx.fillText("✨ Drücke LEERTASTE oder tippe zum Starten ✨", canvas.width / 2, canvas.height / 2 + 150);
        
        ctx.textAlign = "left";
      }

      if (gameOver) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#E8C7C8";
        ctx.font = "bold 48px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Game Over!", canvas.width / 2, canvas.height / 2 - 40);
        ctx.fillStyle = "#F6F1E9";
        ctx.font = "28px Arial";
        ctx.fillText(`Punkte: ${Math.floor(score)}`, canvas.width / 2, canvas.height / 2 + 10);
        ctx.fillText(`Bester: ${Math.floor(highScore)}`, canvas.width / 2, canvas.height / 2 + 50);
        ctx.font = "20px Arial";
        ctx.fillText("Drücke LEERTASTE zum Neustarten", canvas.width / 2, canvas.height / 2 + 100);
        ctx.textAlign = "left";
      }
    }

    // Game loop
    function gameLoop() {
      update();
      draw();
      animationId = requestAnimationFrame(gameLoop);
    }

    // Keyboard controls
    function handleKeyDown(e: KeyboardEvent) {
      if (e.code === "Space" || e.key === " ") {
        e.preventDefault();
        
        if (!gameStarted) {
          gameStarted = true;
          return;
        }

        if (gameOver) {
          // Restart game
          gameOver = false;
          score = 0;
          obstacles = [];
          obstacleTimer = 0;
          frameCount = 0;
          gameSpeed = baseSpeed;
          player.y = groundY - player.height;
          player.velocityY = 0;
          player.jumping = false;
          player.grounded = true;
          gameStarted = true;
          return;
        }

        if (player.grounded) {
          player.jumping = true;
          player.grounded = false;
          player.velocityY = -13;
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    gameLoop();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F1E9] via-[#E8C7C8]/20 to-white flex flex-col items-center justify-center p-8">
      <div className="mb-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Heart className="size-10 text-[#C6A75E] fill-[#C6A75E]" />
          <h1 className="text-4xl font-serif text-slate-800">Hochzeits-Runner</h1>
          <Heart className="size-10 text-[#C6A75E] fill-[#C6A75E]" />
        </div>
        <p className="text-slate-600 text-lg">Easter Egg gefunden! 🎉</p>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          className="border-4 border-[#E8C7C8] rounded-lg shadow-2xl bg-white"
          onClick={handleCanvasClick}
        />
      </div>

      <div className="mt-6 flex gap-4">
        <Button
          onClick={() => navigate("/")}
          variant="outline"
          className="border-[#C6A75E] text-[#A3B18A] hover:bg-[#E8C7C8]/10"
        >
          <X className="size-4 mr-2" />
          Zurück zur Anmeldung
        </Button>
      </div>

      <div className="mt-6 text-center text-slate-500 text-sm max-w-md">
        <p>🎮 Steuerung: LEERTASTE zum Springen</p>
        <p className="mt-2">Weiche Hochzeitstorten, Blumensträußen und Champagner-Gläsern aus!</p>
      </div>
    </div>
  );
}