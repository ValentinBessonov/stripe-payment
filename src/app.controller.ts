import { Controller, Get, Post } from '@nestjs/common';
import { Body, HttpCode } from '@nestjs/common/decorators';

@Controller("api")
export class AppController {
  private stripe;

  constructor() {
    this.stripe = require("stripe")(process.env.STRYPE_KEY);
  }

  @Get("connection_token")
  async ConnectionToken() {
    const connectionToken = await this.stripe.terminal.connectionTokens.create();
    return {
      result: {
        secret: connectionToken.secret
      }
    }
  }

  @HttpCode(200)
  @Post("create_location")
  async CreateLocation() {
    const location = await this.stripe.terminal.locations.create({
      result: {
        display_name: 'HQ',
        address: {
          line1: '1272 Valencia Street',
          city: 'San Francisco',
          state: 'CA',
          country: 'US',
          postal_code: '94110',
        }
      }
    });

    return location;
  }

  @HttpCode(200)
  @Post("capture_payment_intent")
  async CapturePaymentIntent(@Body() body) {
    const intent = await this.stripe.paymentIntents.capture(body.payment_intent_id);
    return { result: intent };
  }

  @Get("payments")
  async GetPayments() {
    const paymentIntents = await this.stripe.paymentIntents.list();
    // return paymentIntents;
    return {
      result: paymentIntents.data
        .filter(x => x.status == 'succeeded')
        .map(x => {
          return {
            id: x.id,
            amount: x.amount / 100,
            created: new Date(x.created).toISOString(), // convert to c# format
            currency: x.currency,
            description: x.description
          }
        })
    };
  }
}
