import {Request, Response} from 'express';
import Users from '../database/models/users.model';
import Rides from '../database/models/rides.model';

export const getAllRides = async (req: Request, res: Response) => {
    try {
        const allRides = await Rides.query();
        return res.status(200).json({rides: allRides});
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({message: 'Internal server error'});
    }
};

export const getRidesWithDrivers = async (req: Request, res: Response) => {
    try {
        const ridesWithDrivers = await Rides.query()
            .select(
                'users.name as driverName',
                'users.email as driverEmail',
                'models.modelName as driverModelName',
                'brands.brandName as driverBrandName',
                'startAddresses.zipCode as startZipCode',
                'startAddresses.houseNumber as startHouseNumber',
                'startStreets.streetName as startStreetName',
                'startCities.cityName as startCityName',
                'startCountries.countryName as startCountryName',
                'destinationAddresses.zipCode as destinationZipCode',
                'destinationAddresses.houseNumber as destinationHouseNumber',
                'destinationStreets.streetName as destinationStreetName',
                'destinationCities.cityName as destinationCityName',
                'destinationCountries.countryName as destinationCountryName',
                'rides.earliestDepartureTime',
                'rides.latestDepartureTime',
                'rides.pricePerPerson',
                'rides.seatsNumber',
                'rides.registrationNumber'
            )
            .join('users', 'rides.driverId', 'users.id')
            .join('models', 'users.modelId', 'models.id')
            .join('brands', 'models.brandId', 'brands.id')
            .join('addresses as startAddresses', 'rides.startAddressId', 'startAddresses.id')
            .join('streets as startStreets', 'startAddresses.streetId', 'startStreets.id')
            .join('cities as startCities', 'startStreets.cityId', 'startCities.id')
            .join('countries as startCountries', 'startCities.countryId', 'startCountries.id')
            .join('addresses as destinationAddresses', 'rides.destinationAddressId', 'destinationAddresses.id')
            .join('streets as destinationStreets', 'destinationAddresses.streetId', 'destinationStreets.id')
            .join('cities as destinationCities', 'destinationStreets.cityId', 'destinationCities.id')
            .join('countries as destinationCountries', 'destinationCities.countryId', 'destinationCountries.id')
            .whereNotNull('rides.driverId')
            .whereNotNull('rides.startAddressId')
            .whereNotNull('rides.destinationAddressId')
            .whereNotNull('users.modelId')
            .whereNotNull('models.brandId')
            .whereNotNull('startAddresses.streetId')
            .whereNotNull('destinationAddresses.streetId')
            .whereNotNull('startCities.id')
            .whereNotNull('destinationCities.id')
            .whereNotNull('startCountries.id')
            .whereNotNull('destinationCountries.id');


        return res.status(200).json({rides: ridesWithDrivers});
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({message: 'Internal server error'});
    }
};

export const createRide = async (req: Request, res: Response) => {
    const {userId} = res.locals.jwt;

    try {
        const user = await Users.query().findById(userId);

        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }

        const {
            modelId,
            earliestDepartureTime,
            latestDepartureTime,
            registrationNumber,
            seatsNumber,
            pricePerPerson,
        } = req.body;

        const parsedModelId = parseInt(modelId);
        const parsedSeatsNumber = parseInt(seatsNumber);
        const parsedPricePerPerson = parseFloat(pricePerPerson);

        if (isNaN(parsedModelId) || isNaN(parsedSeatsNumber) || isNaN(parsedPricePerPerson)) {
            return res.status(400).json({message: 'Invalid data format'});
        }

        const newRide = {
            driverId: userId,
            startAddressId: parseInt(res.locals.startAddressId),
            destinationAddressId: parseInt(res.locals.destinationAddressId),
            modelId: parsedModelId,
            earliestDepartureTime,
            latestDepartureTime,
            pricePerPerson: parsedPricePerPerson,
            seatsNumber: parsedSeatsNumber,
            registrationNumber,
        }

        const insertedRide = await Rides.query().insert(newRide);

        return res.status(201).json({message: 'Ride created successfully', ride: insertedRide});
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({message: 'Internal server error'});
    }
};
