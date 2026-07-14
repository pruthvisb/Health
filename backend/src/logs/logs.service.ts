import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LogsService {
  constructor(private prisma: PrismaService) {}

  // Weight Logs
  async getWeights(userId: string) {
    return this.prisma.weightLog.findMany({
      where: { userId },
      orderBy: { loggedAt: 'asc' },
    });
  }

  async addWeight(userId: string, weight: number) {
    const log = await this.prisma.weightLog.create({
      data: { userId, weight },
    });
    // Update user current weight in profile
    await this.prisma.profile.update({
      where: { userId },
      data: { currentWeight: weight },
    });
    // Add XP
    await this.awardXp(userId, 50);
    return log;
  }

  async deleteWeight(userId: string, id: string) {
    return this.prisma.weightLog.deleteMany({
      where: { id, userId },
    });
  }

  // Food Logs
  async getFoods(userId: string) {
    return this.prisma.foodLog.findMany({
      where: { userId },
      orderBy: { loggedAt: 'desc' },
    });
  }

  async addFood(userId: string, food: any) {
    const log = await this.prisma.foodLog.create({
      data: {
        userId,
        mealType: food.mealType,
        foodName: food.foodName,
        calories: food.calories,
        protein: food.protein,
        fat: food.fat,
        carbs: food.carbs,
        fiber: food.fiber,
        sugar: food.sugar,
        sodium: food.sodium,
        ingredients: food.ingredients || [],
        weightGrams: food.weightGrams,
        imageUrl: food.imageUrl,
        confidence: food.confidence,
      },
    });
    await this.awardXp(userId, 30);
    return log;
  }

  async deleteFood(userId: string, id: string) {
    return this.prisma.foodLog.deleteMany({
      where: { id, userId },
    });
  }

  // Water Logs
  async getWaters(userId: string) {
    return this.prisma.waterLog.findMany({
      where: { userId },
      orderBy: { loggedAt: 'desc' },
    });
  }

  async addWater(userId: string, type: string, amountMl: number) {
    const log = await this.prisma.waterLog.create({
      data: { userId, type, amountMl },
    });
    await this.awardXp(userId, 10);
    return log;
  }

  async deleteWater(userId: string, id: string) {
    return this.prisma.waterLog.deleteMany({
      where: { id, userId },
    });
  }

  // Workout Logs
  async getWorkouts(userId: string) {
    return this.prisma.workoutLog.findMany({
      where: { userId },
      orderBy: { loggedAt: 'desc' },
    });
  }

  async addWorkout(userId: string, workout: any) {
    const log = await this.prisma.workoutLog.create({
      data: {
        userId,
        type: workout.type,
        durationMinutes: workout.durationMinutes,
        caloriesBurned: workout.caloriesBurned,
      },
    });
    await this.awardXp(userId, 100);
    return log;
  }

  async deleteWorkout(userId: string, id: string) {
    return this.prisma.workoutLog.deleteMany({
      where: { id, userId },
    });
  }

  // Gamification helper
  private async awardXp(userId: string, xpAmount: number) {
    const stats = await this.prisma.userStats.findUnique({ where: { userId } });
    if (!stats) return;
    
    const newXp = stats.xp + xpAmount;
    const newLevel = Math.floor(newXp / 1000) + 1;
    
    await this.prisma.userStats.update({
      where: { userId },
      data: {
        xp: newXp,
        level: newLevel,
      },
    });
  }
}
