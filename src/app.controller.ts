import { HttpService } from '@nestjs/axios/dist';
import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller("api")
export class AppController {
  private stripe;

  constructor(private readonly httpService: HttpService) {
    this.stripe = require("stripe")("sk_test_51MlrevGxkAEWJXFvFvAmwavTSDcChcWBylcFnieVbF2BLfZmd9qi1TYCUnFxH11ct14ODPKmfDmIrc9o7Kt0aenk00zjSjJ7Ld");
  }

  @Get("token")
  async CreateToken() {
    const token = await this.stripe.terminal.connectionTokens.create();
    return token

  }

  @Post("create-location")
  async CreateLocation() {
    const location = await this.stripe.terminal.locations.create({
      display_name: 'HQ',
      address: {
        line1: '1272 Valencia Street',
        city: 'San Francisco',
        state: 'CA',
        country: 'US',
        postal_code: '94110',
      }
    });

    return location;
  }
}
