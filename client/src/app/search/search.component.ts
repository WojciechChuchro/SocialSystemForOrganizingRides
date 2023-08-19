import {ChangeDetectorRef, Component, OnInit} from '@angular/core'
import {SearchService} from '../../services/search.service'
import {Router} from '@angular/router'
import {RideSharingService} from '../../services/ride-sharing.service'

export interface Ride {
	id: number;
	driverName: string;
	driverEmail: string;
	driverModelName: string;
	driverBrandName: string;
	startZipCode: string;
	startHouseNumber: string;
	startStreetName: string;
	startCityName: string;
	startCountryName: string;
	destinationZipCode: string;
	destinationHouseNumber: string;
	destinationStreetName: string;
	destinationCityName: string;
	destinationCountryName: string;
	earliestDepartureTime: string;
	latestDepartureTime: string;
	pricePerPerson: number;
	seatsNumber: number;
	registrationNumber: string;
}

@Component({
	selector: 'app-search',
	templateUrl: './search.component.html',
	styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
	rides: Ride[] = []
	userIds: number[] = []
	// searchTerm: string = 'eao';
	loading: boolean = false

	constructor(
		private router: Router,
		private search: SearchService,
		private cdRef: ChangeDetectorRef,
	private rideSharingService: RideSharingService
	) {
	}

	ngOnInit() {
		this.loading = true
		this.fetchRides()

	}

	onRideClick(rideId: number) {
		const ride: Ride | undefined = this.rides.find(r => r.id === rideId)
		if (!ride) {
			return
		}
		this.rideSharingService.changeRide(ride)
		this.router.navigate(['/ride-detail', ride.id])
	}


	formatDate(inputDate: string): string {
		const date = new Date(inputDate)
		const options: Intl.DateTimeFormatOptions = {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		}

		return date.toLocaleDateString('en-GB', options)
	}

	fetchRides() {
		this.search.getAllRides().subscribe({
			next: (response: any) => {
				this.rides = response.rides.map((ride: Ride) => {
					// Format the date strings in each ride object
					ride.earliestDepartureTime = this.formatDate(ride.earliestDepartureTime)
					ride.latestDepartureTime = this.formatDate(ride.latestDepartureTime)
					return ride
				})
			},
			error: (error) => {
				this.loading = false
				console.error('Error fetching rides:', error)
			}
		})
	}

	fetchUsers() {
		this.search.getUsers(this.userIds).subscribe({
			next: (userResponse: any) => {
				// Handle the user response here
				this.loading = false
				console.log('Users response:', userResponse)
			},
			error: (userError: any) => {
				this.loading = false
				console.error('Error fetching users:', userError)
			}
		})
	}


	handleSearch() {

	}
}
