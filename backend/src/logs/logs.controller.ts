import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { LogsService } from './logs.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('logs')
@UseGuards(AuthGuard('jwt'))
export class LogsController {
  constructor(private logsService: LogsService) {}

  // Weights
  @Get('weight')
  async getWeights(@Request() req) {
    return this.logsService.getWeights(req.user.userId);
  }

  @Post('weight')
  async addWeight(@Request() req, @Body() body: { weight: number }) {
    return this.logsService.addWeight(req.user.userId, body.weight);
  }

  @Delete('weight/:id')
  async deleteWeight(@Request() req, @Param('id') id: string) {
    return this.logsService.deleteWeight(req.user.userId, id);
  }

  // Food
  @Get('food')
  async getFoods(@Request() req) {
    return this.logsService.getFoods(req.user.userId);
  }

  @Post('food')
  async addFood(@Request() req, @Body() body: any) {
    return this.logsService.addFood(req.user.userId, body);
  }

  @Delete('food/:id')
  async deleteFood(@Request() req, @Param('id') id: string) {
    return this.logsService.deleteFood(req.user.userId, id);
  }

  // Water
  @Get('water')
  async getWaters(@Request() req) {
    return this.logsService.getWaters(req.user.userId);
  }

  @Post('water')
  async addWater(@Request() req, @Body() body: { type: string; amountMl: number }) {
    return this.logsService.addWater(req.user.userId, body.type, body.amountMl);
  }

  @Delete('water/:id')
  async deleteWater(@Request() req, @Param('id') id: string) {
    return this.logsService.deleteWater(req.user.userId, id);
  }

  // Workouts
  @Get('workout')
  async getWorkouts(@Request() req) {
    return this.logsService.getWorkouts(req.user.userId);
  }

  @Post('workout')
  async addWorkout(@Request() req, @Body() body: any) {
    return this.logsService.addWorkout(req.user.userId, body);
  }

  @Delete('workout/:id')
  async deleteWorkout(@Request() req, @Param('id') id: string) {
    return this.logsService.deleteWorkout(req.user.userId, id);
  }
}
