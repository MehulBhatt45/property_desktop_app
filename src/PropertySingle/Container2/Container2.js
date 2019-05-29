import React, { Component } from "react";
import { Link, Redirect } from 'react-router-dom';
import * as _ from 'lodash';
import { confirmAlert } from 'react-confirm-alert'; // Import
import { ReactIndexedDB } from 'react-indexed-db';
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
// var $;
import { config } from '../../config'

class Container2 extends Component {
	constructor(props){
		super(props);
		this.state = {
			isAdmin: localStorage.getItem('admin')?true:false,
			nearerProperties: [],
			toHome: false
		};
		this.db = new ReactIndexedDB('propertyDB', 1);
	}

    getGoogleMaps() {
        if (!this.googleMapsPromise) {
            console.log("this.googleMapsPromise in property single page line 8=========================>",this.googleMapsPromise)
            this.googleMapsPromise = new Promise((resolve) => {
                window.resolveGoogleMapsPromise = () => {
                    // eslint-disable-next-line no-undef
                    resolve(google);
                    delete window.resolveGoogleMapsPromise;
                };
                const API = 'AIzaSyAKT-kn9iwKJgBidjQy_H89TxZud5ZQK00';
                // var len = $('script').filter(function () {
                //     return ($(this).attr('src') === `https://maps.googleapis.com/maps/api/js?key=${API}&callback=resolveGoogleMapsPromise`);
                // }).length;
                // console.log(len);
                const script = document.createElement("script");
                script.src = `https://maps.googleapis.com/maps/api/js?key=${API}&callback=resolveGoogleMapsPromise`;
                script.async = true;
                document.body.appendChild(script);
            });
        }
        return this.googleMapsPromise;
    }

    componentWillMount() {
		this.getGoogleMaps();
		this.setState({
			isAdmin: localStorage.getItem('admin')?true:false
		});
		var data = {coordinates :this.props.property.geoLocation.coordinates, propertyId: this.props.property._id}
		fetch(config.baseApiUrl+ '/property/get-near-by-properties', {
            method: 'POST',
            body: JSON.stringify(data)
        }).then(res=>{
            return res.json();
        }).then(jsonRes=>{
			console.log(jsonRes);
			this.setState({
				nearerProperties: [...jsonRes]
			});
			console.log(this.state);
        }).catch(err=>{
            console.error(err);
        })
	}
	
	deleteProperty(id){
		confirmAlert({
			title: 'Confirm to delete',
			message: 'Are you sure to do this.',
			buttons: [
				{
					label: 'Yes',
					onClick: () => {
						this.db.openDatabase(1)
						.then(()=>{
							this.db.delete('property', id).then(
								() => {
									this.setState({
										toHome: true
									})
								},
								error => {
									console.log(error);
								}
							);
						},err=>{
							console.log(err);
						})
					}
			  },
			  {
				label: 'No',
			  }
			]
		  });
	}


    componentDidMount() {
        this.getGoogleMaps().then((google) => {
            const uluru = {lat: Number(this.props.property.geoLocation.coordinates[1]), lng: Number(this.props.property.geoLocation.coordinates[0])};
            const map = new google.maps.Map(document.getElementById('propertyMap'), {
                zoom: 15,
                center: uluru
            });
            new google.maps.Marker({
                position: uluru,
                map: map
            });
        });
    }
    render() {
		if (this.state.toHome === true) {
            return <Redirect to='/home' />
          }
        return (
            <div className="container">
				<div className="row">


					<div className="col-lg-8 col-md-7">
						<div className="property-description">


							<ul className="property-main-features">
								<li>Construcción <span>{this.props.property.attributes.area.number} {this.props.property.attributes.area.unit}</span></li>
								<li>Recámaras <span>{this.props.property.attributes.bedrooms?this.props.property.attributes.bedrooms:'-'}</span></li>
								<li>Baños <span>{this.props.property.attributes.bathrooms?this.props.property.attributes.bathrooms:'-'}</span></li>
								{/* <li>Estacionamientos <span>3</span></li> */}
							</ul>



							<h3 className="desc-headline">Descripción</h3>
							<div style={{whiteSpace: 'pre-wrap' }}>
								{this.props.property.description?this.props.property.description:"No Descripción"}
							</div>
							<div className="show-more">

								{/* <a href="/" className="show-more-button">Ver mas <i className="fa fa-angle-down"></i></a> */}
							</div>


							<h3 className="desc-headline">Amenities</h3>
							<ul className="property-features checkboxes margin-top-0">
								{
									_.map(this.props.property.attributes, (val, key)=>
										val === true?<li key={key}>{key}</li>:null
									)
								}
								{/* <li>Aire acondicionado</li>
								<li>Alberca</li>
								<li>Gimnasio</li>
								<li>Alarma</li>
								<li>Fibra Optica</li> */}
							</ul>



							<h3 className="desc-headline no-border">Planos</h3>

							<div className="style-1 fp-accordion">
								<div className="accordion">
									{
										this.props.property.floorImages && this.props.property.floorImages.length
										?
											this.props.property.floorImages.map((propertyFloor, index)=><div key={index}>
										<a className="floor-pic mfp-image" href={config.baseMediaUrl + propertyFloor}>
											<img src={config.baseMediaUrl + propertyFloor} alt=""/>
										</a>
										<p>{this.props.property.floorDescription}</p>
										</div>)
										:<h4>No Planos</h4>
									}
									{/* <h3>Piso Uno <span>460 m&sup2;</span> <i className="fa fa-angle-down"></i> </h3>
									<div>
									<a className="floor-pic mfp-image" href="https://i.imgur.com/kChy7IU.jpg">
										<img src="https://i.imgur.com/kChy7IU.jpg" alt=""/>
									</a>
									<p>Mauris mauris ante, blandit et, ultrices a, susceros. Nam mi. Proin viverra leo ut odio. Curabitur malesuada. Vestibulum a velit eu ante scelerisque vulputate aliquam egestas litora torquent conubia.</p>
									</div>

									<h3>Piso Dos <span>220 m&sup2;</span> <i className="fa fa-angle-down"></i> </h3>
									<div>
									<a className="floor-pic mfp-image" href="https://i.imgur.com/kChy7IU.jpg">
										<img src="https://i.imgur.com/kChy7IU.jpg" alt=""/>
									</a>
									<p>Mauris mauris ante, blandit et, ultrices a, susceros. Nam mi. Proin viverra leo ut odio. Curabitur malesuada. Vestibulum a velit eu ante scelerisque vulputate aliquam egestas litora torquent conubia.</p>
									</div> */}

								</div>
							</div>



							<h3 className="desc-headline no-border" id="location">Ubicación</h3>
							<div id="propertyMap-container">
								<div id="propertyMap"></div>
								<a href="/" id="streetView">Street View</a>
							</div>



							<h3 className="desc-headline no-border margin-bottom-35 margin-top-60">Propiedades Similares</h3>



							<div className="layout-switcher hidden"><a href="/" className="list"><i className="fa fa-th-list"></i></a></div>
							<div className="listings-container list-layout">

								{
									this.state.nearerProperties.length>0
									?this.state.nearerProperties.map(property=>
										<div className="listing-item" key={property._id}>

									<Link to={"/property-single/"+property._id} className="listing-img-container">

										<div className="listing-badges">
											<span>{property.status}</span>
										</div>

										<div className="listing-img-content">
											<span className="listing-price">${property.price} {property.currency}</span>
											<span className="like-icon"></span>
										</div>

										<img src={config.baseMediaUrl + property.images[0]} alt="" onError={()=>this.src='images/no-priview.jpg'}/>

									</Link>

									<div className="listing-content">

										<div className="listing-title">
											<h4><a href="/">{property.title}</a></h4>
											<a href="https://maps.google.com/maps?q=221B+Baker+Street,+London,+United+Kingdom&hl=en&t=v&hnear=221B+Baker+St,+London+NW1+6XE,+United+Kingdom" className="listing-address popup-gmaps">
												<i className="fa fa-map-marker"></i>
												{property.location.address}, {property.location.city}, {property.location.state}.
											</a>

											<Link to={"/property-single/"+property._id} className="details button border">Detalles</Link>
										</div>

										<ul className="listing-details">
											<li>{property.attributes.area.number?property.attributes.area.number+", "+property.attributes.area.unit:"No se ha dado información"}</li>
											<li>{property.attributes.rooms?property.attributes.rooms:'-'} Recámaras</li>
											<li>{property.attributes.bedrooms?property.attributes.bedrooms:'-'} Habitaciónes</li>
											<li>{property.attributes.bathrooms?property.attributes.bathrooms:'-'} Baños</li>
										</ul>

										<div className="listing-footer">
											<a href="/"><i className="fa fa-user"></i> {property.agent.name}</a>
										</div>

									</div>


								</div>
								)
								:<div><h5>No similar properties found</h5></div>
								}


							</div>


						</div>
					</div>




					<div className="col-lg-4 col-md-5">
						<div className="sidebar sticky right">


							<div className="widget margin-bottom-30">
								<button className="widget-button with-tip" data-tip-content="Imprimir"><i className="sl sl-icon-printer"></i></button>
								<button className="widget-button with-tip" data-tip-content="Agregar a favoritos"><i className="fa fa-star-o"></i></button>
								<div><Link to={"/edit-property/"+this.props.property._id}><button className="widget-button with-tip" data-tip-content="Edit property"><i className="fa fa-pencil"></i></button></Link>
								<button className="widget-button with-tip" data-tip-content="Remove property" onClick={()=>{this.deleteProperty(this.props.property._id);}}><i className="fa fa-trash"></i></button></div>
								<div className="clearfix"></div>
							</div>




							{/* <div className="widget">


								<div className="agent-widget">
									<div className="agent-title">
										<div className="agent-photo">
											<img src="/images/agent-avatar.jpg" alt="" />
										</div>
										<div className="agent-details">
											<h4><a href="/">{this.props.property.agent.name}</a></h4>
											<span><i className="sl sl-icon-call-in"></i><a href="tel:551001000">{this.props.property.agent.descrpition}</a></span>
										</div>
										<div className="clearfix"></div>
									</div>

									<input type="text" placeholder="Tu Correo" pattern="^[A-Za-z0-9](([_\.\-]?[a-zA-Z0-9]+)*)@([A-Za-z0-9]+)(([\.\-]?[a-zA-Z0-9]+)*)\.([A-Za-z]{2,})$"/>
									<input type="text" placeholder="Tu Celular"/>
									<textarea defaultValue="Estoy interesado en la propiedad [ID 123456] y quisiera saber mas."></textarea>
									<button className="button fullwidth margin-top-5">Enviar Mensaje</button>
								</div>


							</div> */}




							<div className="widget">
								<h3 className="margin-bottom-30 margin-top-30">Simulador Crédito Hipotecario</h3>


								<form autoComplete="off" className="mortgageCalc" data-calc-currency="MXN">
									<div className="calc-input">
										<div className="pick-price tip" data-tip-content="Set This Property Price"></div>
									    <input type="text" id="amount" name="amount" placeholder="Precio" required/>
									    <label htmlFor="amount" className="fa fa-usd"></label>
									</div>

									<div className="calc-input">
									    <input type="text" id="downpayment" placeholder="Enganche"/>
									    <label htmlFor="downpayment" className="fa fa-usd"></label>
									</div>

									<div className="calc-input">
										<input type="text" id="years" placeholder="Tiempo" required/>
										<label htmlFor="years" className="fa fa-calendar-o"></label>
									</div>

									<div className="calc-input">
										<input type="text" id="interest" placeholder="Tasa de Interes" required/>
										<label htmlFor="interest" className="fa fa-percent"></label>
									</div>

									<button className="button calc-button" formvalidate="true">Calcular</button>
									<div className="calc-output-container"><div className="notification success">Pago Mensual: <strong className="calc-output"></strong></div></div>
								</form>


							</div>



						</div>
					</div>


				</div>
			</div>
        );
    }
}
export default Container2;

