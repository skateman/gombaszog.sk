require 'net/http'
require 'json'
require 'nokogiri'

class ProgramTag < Liquid::Tag

  def render context

    day_l_map = {
      "Monday"    => "hetfo",
      "Tuesday"   => "kedd",
      "Wednesday" => "szerda",
      "Thursday"  => "csutortok",
      "Friday"    => "pentek",
      "Saturday"  => "szombat",
      "Sunday"    => "vasarnap",
    }

    first = 'tab-pane row active'

    data = JSON.parse File.read '_program.json'
    byday = {}
    data.each do |e|
      t = Time.parse(e['start'])
      day = t.to_date
      day = day-1 if t.strftime("%H").to_i < 5
      day = day.strftime('%A') # todo 4:00
      byday[day] = {
        :events => [],
        :locations => []
      } if byday[day] == nil
      byday[day][:events] << e
      byday[day][:locations] << e['location'] unless byday[day][:locations].include? e['location']
    end
    @html = Nokogiri::HTML::DocumentFragment.parse ""
    Nokogiri::HTML::Builder.with(@html) do |html|
      html.div(:class => 'tab-content program-matrix program') do
        byday.each do |d,l|
          html.div(:class => first, :id => day_l_map[d]) do 
            first = 'tab-pane row'
            html.div(:class => 'col-md-2 visible-md visible-lg') do
              html.ul(:class => 'nav nav-pills nav-stacked') do
                l[:locations].each do |loc|
                  html.li(:class => 'active') { html.a(:href => '#') { html.text loc }}
                end
              end
            end
            html.div(:class => 'col-md-10') do
              l[:events].each do |e|
                e['start'] = Time.parse e['start']
                e['end'] = Time.parse e['end']
                html.div(:class => 'program-pont row') do 
                  html.div(:class => 'row') do
                    html.div(:class => 'col-md-10') do
                      html.div(:class => 'col-md-2 meta') do
                        if e['end'] - e['start'] == 60
                          html.div(:class => 'idopont') { html.text e['start'].strftime('%k:%M') }
                        else
                          html.div(:class => 'idopont') { html.text "#{e['start'].strftime('%k:%M')} - #{e['end'].strftime('%k:%M')}" }
                        end
                        html.div(:class => 'helyszin') { html.text e['location'] }
                        html.div(:class => 'szervezo') { html.text e['partner'] }
                      end
                      html.div(:class => 'col-md-10') do
                        html.h3 { html.text e['name'] }
                        html.p { html << e['description'] }
                      end
                    end
                    html.div(:class => 'col-md-2 visible-lg visible-md') do
                      html.img(:src => e['logo'], :class => 'img-responsive')
                    end
                  end
                end
              end
            end
          end
        end
      end
    end
    @html.to_html
  end
  Liquid::Template.register_tag('dyn_program', self)
end



