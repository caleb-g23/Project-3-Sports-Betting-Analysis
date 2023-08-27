const stateDropdown = document.getElementById('stateDropdown');
const stateDataContainer = document.getElementById('stateData');
const jsonDataUrl = 'https://raw.githubusercontent.com/caleb-g23/Project-3-Sports-Betting-Analysis/d5fe22317fe524433683792b672c09c2504c23a8/json/state_total_data.json';

// Fetch JSON data from the provided URL
fetch(jsonDataUrl)
    .then(response => response.json())
    .then(data => {
        // Populate the dropdown with state options
        Object.values(data).forEach(item => {
            const stateOption = document.createElement('option');
            stateOption.value = item.state;
            stateOption.textContent = item.state;
            stateDropdown.appendChild(stateOption);
        });

        // Event listener for state selection
        stateDropdown.addEventListener('change', () => {
            const selectedState = stateDropdown.value;
            const stateInfo = Object.values(data).find(item => item.state === selectedState);

            // Display state information
            if (stateInfo) {
                stateDataContainer.innerHTML = `
                    <p>State: ${stateInfo.state}</p>
                    <p>Handle: ${stateInfo.handle}</p>
                    <p>Revenue: ${stateInfo.revenue}</p>
                    <p>Hold: ${stateInfo.hold}</p>
                    <p>Taxes: ${stateInfo.taxes}</p>
                    <p>Population 18+: ${stateInfo['population total 18+']}</p>
                    <p>Revenue Per Person: ${stateInfo['Revenue Per Person']}</p>
                `;
        
               
                // Update or create the bar chart
                if (chart) {
                    chart.data.labels = ['Handle', 'Revenue', 'Taxes'];
                    chart.data.datasets[0].label = selectedState;
                    chart.data.datasets[0].data = [
                        parseFloat(stateInfo.handle.replace('$', '').replace(',', '')),
                        parseFloat(stateInfo.revenue.replace('$', '').replace(',', '')),
                        parseFloat(stateInfo.taxes.replace('$', '').replace(',', ''))
                    ];
                    chart.update();
                } else {
                    const ctx = document.getElementById('barChart').getContext('2d');
                    chart = new Chart(ctx, {
                        type: 'bar',
                        data: {
                            labels: ['Handle', 'Revenue', 'Taxes'],
                            datasets: [{
                                label: selectedState,
                                data: [
                                    parseFloat(stateInfo.handle.replace('$', '').replace(',', '')),
                                    parseFloat(stateInfo.revenue.replace('$', '').replace(',', '')),
                                    parseFloat(stateInfo.taxes.replace('$', '').replace(',', ''))
                                ],
                                backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(75, 192, 192, 0.6)'],
                            }]
                        },
                        options: {
                            responsive: true,
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    title: {
                                        display: true,
                                        text: 'Amount ($)'
                                    }
                                },
                                x: {
                                    title: {
                                        display: true,
                                        text: 'Categories'
                                    }
                                }
                            }
                        }
                    });
                }
            } else {
                stateDataContainer.innerHTML = '<p>Select a state to view information.</p>';
            }
        });
    })
    .catch(error => console.error('Error fetching data:', error));